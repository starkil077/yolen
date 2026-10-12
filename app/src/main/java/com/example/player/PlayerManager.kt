package com.example.player

import android.content.Context
import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.example.model.AudioPreset
import com.example.model.MediaItemData
import com.example.model.RepeatMode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.random.Random

class PlayerManager(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.Main + Job())
    val exoPlayer: ExoPlayer = ExoPlayer.Builder(context).build()

    private val _queue = MutableStateFlow<List<MediaItemData>>(emptyList())
    val queue: StateFlow<List<MediaItemData>> = _queue.asStateFlow()

    private val _queueIndex = MutableStateFlow(-1)
    val queueIndex: StateFlow<Int> = _queueIndex.asStateFlow()

    private val _currentTrack = MutableStateFlow<MediaItemData?>(null)
    val currentTrack: StateFlow<MediaItemData?> = _currentTrack.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _isBuffering = MutableStateFlow(false)
    val isBuffering: StateFlow<Boolean> = _isBuffering.asStateFlow()

    private val _currentPositionMs = MutableStateFlow(0L)
    val currentPositionMs: StateFlow<Long> = _currentPositionMs.asStateFlow()

    private val _durationMs = MutableStateFlow(0L)
    val durationMs: StateFlow<Long> = _durationMs.asStateFlow()

    private val _playbackSpeed = MutableStateFlow(1.0f)
    val playbackSpeed: StateFlow<Float> = _playbackSpeed.asStateFlow()

    private val _repeatMode = MutableStateFlow(RepeatMode.OFF)
    val repeatMode: StateFlow<RepeatMode> = _repeatMode.asStateFlow()

    private val _isShuffle = MutableStateFlow(false)
    val isShuffle: StateFlow<Boolean> = _isShuffle.asStateFlow()

    private val _audioPreset = MutableStateFlow(AudioPreset.FLAT)
    val audioPreset: StateFlow<AudioPreset> = _audioPreset.asStateFlow()

    private val _sleepTimerSeconds = MutableStateFlow(0)
    val sleepTimerSeconds: StateFlow<Int> = _sleepTimerSeconds.asStateFlow()

    // 0 = FIT, 1 = ZOOM, 2 = FILL
    private val _videoResizeMode = MutableStateFlow(0)
    val videoResizeMode: StateFlow<Int> = _videoResizeMode.asStateFlow()

    // Simulated waveform amplitudes for visualizer
    private val _visualizerBars = MutableStateFlow<List<Float>>(List(24) { 0.15f })
    val visualizerBars: StateFlow<List<Float>> = _visualizerBars.asStateFlow()

    private var progressJob: Job? = null
    private var sleepTimerJob: Job? = null
    private var unShuffledQueue: List<MediaItemData> = emptyList()

    init {
        setupPlayerListener()
        startPeriodicProgressTracker()
    }

    private fun setupPlayerListener() {
        exoPlayer.addListener(object : Player.Listener {
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                _isPlaying.value = isPlaying
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                when (playbackState) {
                    Player.STATE_BUFFERING -> {
                        _isBuffering.value = true
                    }
                    Player.STATE_READY -> {
                        _isBuffering.value = false
                        val dur = exoPlayer.duration
                        if (dur > 0) {
                            _durationMs.value = dur
                        }
                    }
                    Player.STATE_ENDED -> {
                        _isBuffering.value = false
                        handleTrackEnded()
                    }
                    Player.STATE_IDLE -> {
                        _isBuffering.value = false
                    }
                }
            }
        })
    }

    private fun startPeriodicProgressTracker() {
        progressJob?.cancel()
        progressJob = scope.launch {
            while (isActive) {
                if (exoPlayer.isPlaying) {
                    _currentPositionMs.value = exoPlayer.currentPosition.coerceAtLeast(0L)
                    val dur = exoPlayer.duration
                    if (dur > 0) {
                        _durationMs.value = dur
                    }

                    // Animate visualizer bars
                    val newBars = List(24) { index ->
                        val base = 0.2f + 0.75f * Random.nextFloat()
                        // slight wave modulation
                        val wave = kotlin.math.sin((System.currentTimeMillis() / 200.0) + index * 0.4).toFloat()
                        (base * 0.6f + (wave + 1f) * 0.2f).coerceIn(0.1f, 1.0f)
                    }
                    _visualizerBars.value = newBars
                } else {
                    // gentle idle wave
                    if (_visualizerBars.value.any { it > 0.2f }) {
                        _visualizerBars.value = List(24) { 0.15f }
                    }
                }
                delay(200)
            }
        }
    }

    fun setQueue(tracks: List<MediaItemData>, startIndex: Int = 0, autoPlay: Boolean = true) {
        if (tracks.isEmpty()) return
        unShuffledQueue = tracks
        _queue.value = tracks
        val safeIndex = startIndex.coerceIn(0, tracks.lastIndex)
        _queueIndex.value = safeIndex
        loadTrackAtIndex(safeIndex, autoPlay)
    }

    fun playTrack(track: MediaItemData) {
        val currentList = _queue.value.toMutableList()
        val existingIndex = currentList.indexOfFirst { it.id == track.id }
        if (existingIndex >= 0) {
            _queueIndex.value = existingIndex
            loadTrackAtIndex(existingIndex, autoPlay = true)
        } else {
            // Append and play
            currentList.add(track)
            _queue.value = currentList
            val newIndex = currentList.lastIndex
            _queueIndex.value = newIndex
            loadTrackAtIndex(newIndex, autoPlay = true)
        }
    }

    fun addToQueue(track: MediaItemData) {
        val currentList = _queue.value.toMutableList()
        currentList.add(track)
        _queue.value = currentList
        if (_currentTrack.value == null) {
            _queueIndex.value = 0
            loadTrackAtIndex(0, autoPlay = false)
        }
    }

    fun playNext(track: MediaItemData) {
        val currentList = _queue.value.toMutableList()
        val insertIndex = (_queueIndex.value + 1).coerceIn(0, currentList.size)
        currentList.add(insertIndex, track)
        _queue.value = currentList
        if (_currentTrack.value == null) {
            _queueIndex.value = 0
            loadTrackAtIndex(0, autoPlay = true)
        }
    }

    fun removeFromQueue(index: Int) {
        val currentList = _queue.value.toMutableList()
        if (index !in currentList.indices) return

        val removingCurrent = (index == _queueIndex.value)
        currentList.removeAt(index)
        _queue.value = currentList

        if (currentList.isEmpty()) {
            exoPlayer.stop()
            exoPlayer.clearMediaItems()
            _currentTrack.value = null
            _queueIndex.value = -1
            _currentPositionMs.value = 0L
            _durationMs.value = 0L
        } else if (removingCurrent) {
            val nextIndex = index.coerceAtMost(currentList.lastIndex)
            _queueIndex.value = nextIndex
            loadTrackAtIndex(nextIndex, autoPlay = true)
        } else if (index < _queueIndex.value) {
            _queueIndex.value = _queueIndex.value - 1
        }
    }

    fun moveQueueItem(fromIndex: Int, toIndex: Int) {
        val currentList = _queue.value.toMutableList()
        if (fromIndex !in currentList.indices || toIndex !in currentList.indices || fromIndex == toIndex) return

        val item = currentList.removeAt(fromIndex)
        currentList.add(toIndex, item)
        _queue.value = currentList

        // adjust current index
        val curr = _queueIndex.value
        if (curr == fromIndex) {
            _queueIndex.value = toIndex
        } else if (fromIndex < curr && toIndex >= curr) {
            _queueIndex.value = curr - 1
        } else if (fromIndex > curr && toIndex <= curr) {
            _queueIndex.value = curr + 1
        }
    }

    fun clearQueue() {
        exoPlayer.stop()
        exoPlayer.clearMediaItems()
        _queue.value = emptyList()
        _queueIndex.value = -1
        _currentTrack.value = null
        _currentPositionMs.value = 0L
        _durationMs.value = 0L
    }

    fun skipToQueueIndex(index: Int) {
        if (index in _queue.value.indices) {
            _queueIndex.value = index
            loadTrackAtIndex(index, autoPlay = true)
        }
    }

    fun skipToNext() {
        val q = _queue.value
        if (q.isEmpty()) return
        val nextIndex = _queueIndex.value + 1
        if (nextIndex in q.indices) {
            _queueIndex.value = nextIndex
            loadTrackAtIndex(nextIndex, autoPlay = true)
        } else if (_repeatMode.value == RepeatMode.ALL) {
            _queueIndex.value = 0
            loadTrackAtIndex(0, autoPlay = true)
        }
    }

    fun skipToPrevious() {
        val q = _queue.value
        if (q.isEmpty()) return
        // If > 3 seconds into track, restart current track
        if (exoPlayer.currentPosition > 3000L) {
            seekTo(0L)
            return
        }
        val prevIndex = _queueIndex.value - 1
        if (prevIndex in q.indices) {
            _queueIndex.value = prevIndex
            loadTrackAtIndex(prevIndex, autoPlay = true)
        } else if (_repeatMode.value == RepeatMode.ALL) {
            _queueIndex.value = q.lastIndex
            loadTrackAtIndex(q.lastIndex, autoPlay = true)
        } else {
            seekTo(0L)
        }
    }

    private fun handleTrackEnded() {
        when (_repeatMode.value) {
            RepeatMode.ONE -> {
                seekTo(0L)
                exoPlayer.play()
            }
            RepeatMode.ALL -> {
                skipToNext()
            }
            RepeatMode.OFF -> {
                val nextIndex = _queueIndex.value + 1
                if (nextIndex in _queue.value.indices) {
                    skipToNext()
                } else {
                    // Reached end of queue
                    _isPlaying.value = false
                }
            }
        }
    }

    private fun loadTrackAtIndex(index: Int, autoPlay: Boolean) {
        val track = _queue.value.getOrNull(index) ?: return
        _currentTrack.value = track
        _durationMs.value = track.durationMs
        _currentPositionMs.value = 0L

        val mediaItem = MediaItem.fromUri(Uri.parse(track.mediaUri))
        exoPlayer.setMediaItem(mediaItem)
        exoPlayer.prepare()
        exoPlayer.playbackParameters = PlaybackParameters(_playbackSpeed.value)
        if (autoPlay) {
            exoPlayer.play()
        }
    }

    fun togglePlayPause() {
        if (exoPlayer.isPlaying) {
            exoPlayer.pause()
        } else {
            if (_currentTrack.value == null && _queue.value.isNotEmpty()) {
                skipToQueueIndex(0)
            } else {
                exoPlayer.play()
            }
        }
    }

    fun seekTo(positionMs: Long) {
        exoPlayer.seekTo(positionMs)
        _currentPositionMs.value = positionMs
    }

    fun seekForward10s() {
        val newPos = (exoPlayer.currentPosition + 10_000L).coerceAtMost(exoPlayer.duration.coerceAtLeast(0L))
        seekTo(newPos)
    }

    fun seekBackward10s() {
        val newPos = (exoPlayer.currentPosition - 10_000L).coerceAtLeast(0L)
        seekTo(newPos)
    }

    fun setRepeatMode(mode: RepeatMode) {
        _repeatMode.value = mode
    }

    fun cycleRepeatMode() {
        _repeatMode.value = when (_repeatMode.value) {
            RepeatMode.OFF -> RepeatMode.ALL
            RepeatMode.ALL -> RepeatMode.ONE
            RepeatMode.ONE -> RepeatMode.OFF
        }
    }

    fun toggleShuffle() {
        val newShuffle = !_isShuffle.value
        _isShuffle.value = newShuffle
        val currentTrackItem = _currentTrack.value

        if (newShuffle) {
            val q = _queue.value.toMutableList()
            if (currentTrackItem != null) {
                q.remove(currentTrackItem)
                q.shuffle()
                q.add(0, currentTrackItem)
                _queue.value = q
                _queueIndex.value = 0
            } else {
                q.shuffle()
                _queue.value = q
            }
        } else {
            if (unShuffledQueue.isNotEmpty()) {
                _queue.value = unShuffledQueue
                val newIdx = unShuffledQueue.indexOfFirst { it.id == currentTrackItem?.id }
                _queueIndex.value = if (newIdx >= 0) newIdx else 0
            }
        }
    }

    fun setPlaybackSpeed(speed: Float) {
        _playbackSpeed.value = speed
        exoPlayer.playbackParameters = PlaybackParameters(speed)
    }

    fun cyclePlaybackSpeed() {
        val speeds = listOf(0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 2.0f)
        val currentIndex = speeds.indexOf(_playbackSpeed.value).let { if (it < 0) 2 else it }
        val nextIndex = (currentIndex + 1) % speeds.size
        setPlaybackSpeed(speeds[nextIndex])
    }

    fun setAudioPreset(preset: AudioPreset) {
        _audioPreset.value = preset
        // In real Android audio, this can link to Equalizer session if available,
        // here it provides distinct audio simulation presets and DSP styling
    }

    fun cycleVideoResizeMode() {
        // 0 = FIT, 1 = ZOOM, 2 = FILL
        _videoResizeMode.value = (_videoResizeMode.value + 1) % 3
    }

    fun startSleepTimer(minutes: Int) {
        sleepTimerJob?.cancel()
        if (minutes <= 0) {
            _sleepTimerSeconds.value = 0
            return
        }
        _sleepTimerSeconds.value = minutes * 60
        sleepTimerJob = scope.launch {
            while (_sleepTimerSeconds.value > 0) {
                delay(1000)
                _sleepTimerSeconds.value -= 1
            }
            // Timer expired: stop playback
            if (exoPlayer.isPlaying) {
                exoPlayer.pause()
            }
        }
    }

    fun cancelSleepTimer() {
        sleepTimerJob?.cancel()
        _sleepTimerSeconds.value = 0
    }

    fun release() {
        progressJob?.cancel()
        sleepTimerJob?.cancel()
        exoPlayer.release()
    }
}
