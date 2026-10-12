package com.example.ui

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.AppDatabase
import com.example.data.PlaylistRepository
import com.example.data.SampleMediaLibrary
import com.example.data.dao.PlaylistWithItemCount
import com.example.model.AudioPreset
import com.example.model.MediaItemData
import com.example.model.RepeatMode
import com.example.player.PlayerManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

enum class LibraryTab(val title: String) {
    ALL("الكل"),
    AUDIO("موسيقى"),
    VIDEO("فيديوهات"),
    PLAYLISTS("قوائم التشغيل"),
    QUEUE("الطابور")
}

class MainViewModel(application: Application) : AndroidViewModel(application) {

    val playerManager = PlayerManager(application)
    private val database = AppDatabase.getDatabase(application)
    private val playlistRepo = PlaylistRepository(database.playlistDao())

    val playlists: StateFlow<List<PlaylistWithItemCount>> = playlistRepo.allPlaylists
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _customTracks = MutableStateFlow<List<MediaItemData>>(SampleMediaLibrary.sampleTracks)
    val customTracks: StateFlow<List<MediaItemData>> = _customTracks.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _activeTab = MutableStateFlow(LibraryTab.ALL)
    val activeTab: StateFlow<LibraryTab> = _activeTab.asStateFlow()

    private val _selectedPlaylist = MutableStateFlow<PlaylistWithItemCount?>(null)
    val selectedPlaylist: StateFlow<PlaylistWithItemCount?> = _selectedPlaylist.asStateFlow()

    private val _selectedPlaylistTracks = MutableStateFlow<List<MediaItemData>>(emptyList())
    val selectedPlaylistTracks: StateFlow<List<MediaItemData>> = _selectedPlaylistTracks.asStateFlow()

    private val _isFullPlayerExpanded = MutableStateFlow(false)
    val isFullPlayerExpanded: StateFlow<Boolean> = _isFullPlayerExpanded.asStateFlow()

    private val _isFullScreenVideo = MutableStateFlow(false)
    val isFullScreenVideo: StateFlow<Boolean> = _isFullScreenVideo.asStateFlow()

    // Dialog States
    private val _showCreatePlaylistDialog = MutableStateFlow(false)
    val showCreatePlaylistDialog: StateFlow<Boolean> = _showCreatePlaylistDialog.asStateFlow()

    private val _trackToAddToPlaylist = MutableStateFlow<MediaItemData?>(null)
    val trackToAddToPlaylist: StateFlow<MediaItemData?> = _trackToAddToPlaylist.asStateFlow()

    private val _showAddStreamDialog = MutableStateFlow(false)
    val showAddStreamDialog: StateFlow<Boolean> = _showAddStreamDialog.asStateFlow()

    private val _showEqualizerDialog = MutableStateFlow(false)
    val showEqualizerDialog: StateFlow<Boolean> = _showEqualizerDialog.asStateFlow()

    private val _showSleepTimerDialog = MutableStateFlow(false)
    val showSleepTimerDialog: StateFlow<Boolean> = _showSleepTimerDialog.asStateFlow()

    // Filtered tracks
    val filteredTracks: StateFlow<List<MediaItemData>> = combine(
        _customTracks,
        _searchQuery,
        _activeTab
    ) { tracks, query, tab ->
        val queryTrimmed = query.trim().lowercase()
        tracks.filter { track ->
            val matchesTab = when (tab) {
                LibraryTab.ALL -> true
                LibraryTab.AUDIO -> !track.isVideo
                LibraryTab.VIDEO -> track.isVideo
                LibraryTab.PLAYLISTS, LibraryTab.QUEUE -> true
            }
            val matchesQuery = queryTrimmed.isEmpty() ||
                    track.title.lowercase().contains(queryTrimmed) ||
                    track.artist.lowercase().contains(queryTrimmed) ||
                    track.genre.lowercase().contains(queryTrimmed)

            matchesTab && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        // Initialize queue with sample tracks so user can immediately play or test
        playerManager.setQueue(SampleMediaLibrary.sampleTracks, startIndex = 0, autoPlay = false)
        seedInitialPlaylistsIfNeeded()
    }

    private fun seedInitialPlaylistsIfNeeded() {
        viewModelScope.launch {
            // Check if seeded
            val currentPlaylists = database.playlistDao().getPlaylistById(1L)
            if (currentPlaylists == null) {
                val plId = playlistRepo.createPlaylist("المختارات السينمائية والموسيقية")
                playlistRepo.addItemsToPlaylist(plId, SampleMediaLibrary.sampleTracks.take(4))

                val plAudioId = playlistRepo.createPlaylist("أجواء الاسترخاء (Chill & Beats)")
                playlistRepo.addItemsToPlaylist(plAudioId, SampleMediaLibrary.sampleTracks.filter { !it.isVideo })
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun onTabSelected(tab: LibraryTab) {
        _activeTab.value = tab
    }

    fun setFullPlayerExpanded(expanded: Boolean) {
        _isFullPlayerExpanded.value = expanded
    }

    fun setFullScreenVideo(fullScreen: Boolean) {
        _isFullScreenVideo.value = fullScreen
    }

    fun playTrack(track: MediaItemData) {
        playerManager.playTrack(track)
        _isFullPlayerExpanded.value = true
    }

    fun playAll(tracks: List<MediaItemData>, startIndex: Int = 0) {
        if (tracks.isNotEmpty()) {
            playerManager.setQueue(tracks, startIndex = startIndex, autoPlay = true)
            _isFullPlayerExpanded.value = true
        }
    }

    fun playNext(track: MediaItemData) {
        playerManager.playNext(track)
    }

    fun addToQueue(track: MediaItemData) {
        playerManager.addToQueue(track)
    }

    fun openPlaylist(playlist: PlaylistWithItemCount) {
        _selectedPlaylist.value = playlist
        viewModelScope.launch {
            playlistRepo.getItemsForPlaylist(playlist.id).collect { tracks ->
                _selectedPlaylistTracks.value = tracks
            }
        }
    }

    fun closePlaylistDetail() {
        _selectedPlaylist.value = null
        _selectedPlaylistTracks.value = emptyList()
    }

    fun createPlaylist(name: String) {
        if (name.isBlank()) return
        viewModelScope.launch {
            playlistRepo.createPlaylist(name.trim())
            _showCreatePlaylistDialog.value = false
        }
    }

    fun deletePlaylist(playlistId: Long) {
        viewModelScope.launch {
            playlistRepo.deletePlaylist(playlistId)
            if (_selectedPlaylist.value?.id == playlistId) {
                closePlaylistDetail()
            }
        }
    }

    fun addTrackToPlaylist(playlistId: Long, track: MediaItemData) {
        viewModelScope.launch {
            playlistRepo.addItemToPlaylist(playlistId, track)
            _trackToAddToPlaylist.value = null
        }
    }

    fun saveCurrentQueueAsPlaylist(playlistName: String) {
        val q = playerManager.queue.value
        if (q.isEmpty() || playlistName.isBlank()) return
        viewModelScope.launch {
            val id = playlistRepo.createPlaylist(playlistName.trim())
            playlistRepo.addItemsToPlaylist(id, q)
        }
    }

    fun openAddToPlaylistDialog(track: MediaItemData) {
        _trackToAddToPlaylist.value = track
    }

    fun closeAddToPlaylistDialog() {
        _trackToAddToPlaylist.value = null
    }

    fun setCreatePlaylistDialogVisible(visible: Boolean) {
        _showCreatePlaylistDialog.value = visible
    }

    fun setAddStreamDialogVisible(visible: Boolean) {
        _showAddStreamDialog.value = visible
    }

    fun setEqualizerDialogVisible(visible: Boolean) {
        _showEqualizerDialog.value = visible
    }

    fun setSleepTimerDialogVisible(visible: Boolean) {
        _showSleepTimerDialog.value = visible
    }

    fun addStreamUrl(url: String, title: String?, isVideo: Boolean) {
        val cleanUrl = url.trim()
        if (cleanUrl.isBlank()) return

        val finalTitle = if (!title.isNullOrBlank()) title.trim() else "بث مباشر #${(_customTracks.value.size + 1)}"
        val newTrack = MediaItemData(
            id = "stream_" + UUID.randomUUID().toString().take(8),
            title = finalTitle,
            artist = "بث مخصص (Stream)",
            mediaUri = cleanUrl,
            artworkUri = if (isVideo) "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&q=80" else "https://images.unsplash.com/photo-1445985543469-753ec9585f2b?w=600&q=80",
            durationMs = 0L,
            isVideo = isVideo,
            genre = "رابط خارجي"
        )

        _customTracks.value = listOf(newTrack) + _customTracks.value
        playerManager.addToQueue(newTrack)
        _showAddStreamDialog.value = false
    }

    fun addImportedFiles(uris: List<Uri>, isVideo: Boolean) {
        val newTracks = uris.mapIndexed { idx, uri ->
            val path = uri.lastPathSegment ?: "ملف مستورد"
            val cleanName = path.substringAfterLast("/").substringBeforeLast(".")
            MediaItemData(
                id = "local_" + UUID.randomUUID().toString().take(8),
                title = cleanName.ifBlank { "مقطع مستورد ${idx + 1}" },
                artist = "ملف من الجهاز",
                mediaUri = uri.toString(),
                artworkUri = "",
                durationMs = 0L,
                isVideo = isVideo,
                genre = "ملفات الجهاز",
                isLocal = true
            )
        }
        _customTracks.value = newTracks + _customTracks.value
        newTracks.forEach { playerManager.addToQueue(it) }
    }

    override fun onCleared() {
        super.onCleared()
        playerManager.release()
    }
}
