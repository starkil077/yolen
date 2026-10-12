package com.example.ui

import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.PlayCircle
import androidx.compose.material.icons.filled.QueueMusic
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.components.AddToPlaylistDialog
import com.example.ui.components.AddStreamDialog
import com.example.ui.components.CreatePlaylistDialog
import com.example.ui.components.EqualizerDialog
import com.example.ui.components.MiniPlayer
import com.example.ui.components.SleepTimerDialog
import com.example.ui.screens.FullPlayerScreen
import com.example.ui.screens.LibraryView
import com.example.ui.screens.PlaylistDetailView
import com.example.ui.screens.PlaylistsView
import com.example.ui.screens.QueueView
import com.example.ui.theme.DarkObsidian
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceVariant
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.GoldenAmber
import com.example.ui.theme.NeonViolet

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(
    viewModel: MainViewModel = viewModel()
) {
    val playerManager = viewModel.playerManager

    val currentTrack by playerManager.currentTrack.collectAsStateWithLifecycle()
    val isPlaying by playerManager.isPlaying.collectAsStateWithLifecycle()
    val currentPosMs by playerManager.currentPositionMs.collectAsStateWithLifecycle()
    val durationMs by playerManager.durationMs.collectAsStateWithLifecycle()
    val queue by playerManager.queue.collectAsStateWithLifecycle()
    val queueIndex by playerManager.queueIndex.collectAsStateWithLifecycle()
    val repeatMode by playerManager.repeatMode.collectAsStateWithLifecycle()
    val isShuffle by playerManager.isShuffle.collectAsStateWithLifecycle()
    val playbackSpeed by playerManager.playbackSpeed.collectAsStateWithLifecycle()
    val audioPreset by playerManager.audioPreset.collectAsStateWithLifecycle()
    val sleepTimerSeconds by playerManager.sleepTimerSeconds.collectAsStateWithLifecycle()
    val videoResizeMode by playerManager.videoResizeMode.collectAsStateWithLifecycle()
    val visualizerBars by playerManager.visualizerBars.collectAsStateWithLifecycle()

    val playlists by viewModel.playlists.collectAsStateWithLifecycle()
    val filteredTracks by viewModel.filteredTracks.collectAsStateWithLifecycle()
    val activeTab by viewModel.activeTab.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedPlaylist by viewModel.selectedPlaylist.collectAsStateWithLifecycle()
    val selectedPlaylistTracks by viewModel.selectedPlaylistTracks.collectAsStateWithLifecycle()
    val isFullPlayerExpanded by viewModel.isFullPlayerExpanded.collectAsStateWithLifecycle()

    val showCreatePlaylistDialog by viewModel.showCreatePlaylistDialog.collectAsStateWithLifecycle()
    val trackToAddToPlaylist by viewModel.trackToAddToPlaylist.collectAsStateWithLifecycle()
    val showAddStreamDialog by viewModel.showAddStreamDialog.collectAsStateWithLifecycle()
    val showEqualizerDialog by viewModel.showEqualizerDialog.collectAsStateWithLifecycle()
    val showSleepTimerDialog by viewModel.showSleepTimerDialog.collectAsStateWithLifecycle()

    // File picker launcher
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments()
    ) { uris: List<Uri> ->
        if (uris.isNotEmpty()) {
            val isVideo = (activeTab == LibraryTab.VIDEO)
            viewModel.addImportedFiles(uris, isVideo = isVideo)
        }
    }

    // Predictive / Custom Back Handling
    BackHandler(enabled = isFullPlayerExpanded || selectedPlaylist != null || activeTab != LibraryTab.ALL) {
        when {
            isFullPlayerExpanded -> viewModel.setFullPlayerExpanded(false)
            selectedPlaylist != null -> viewModel.closePlaylistDetail()
            activeTab != LibraryTab.ALL -> viewModel.onTabSelected(LibraryTab.ALL)
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(DarkObsidian)) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.PlayCircle,
                                contentDescription = null,
                                tint = ElectricCyan,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "PulsePlayer",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 18.sp
                                    ),
                                    color = Color.White
                                )
                                Text(
                                    text = "مشغل الوسائط والقوائم الاحترافي",
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                                    color = ElectricCyan
                                )
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = { viewModel.setSleepTimerDialogVisible(true) }) {
                            BadgedBox(
                                badge = {
                                    if (sleepTimerSeconds > 0) {
                                        Badge(containerColor = GoldenAmber) {
                                            Text("${sleepTimerSeconds / 60}m", fontSize = 8.sp)
                                        }
                                    }
                                }
                            ) {
                                Icon(
                                    Icons.Default.Timer,
                                    contentDescription = "مؤقت النوم",
                                    tint = if (sleepTimerSeconds > 0) GoldenAmber else Color.White
                                )
                            }
                        }

                        IconButton(onClick = { viewModel.setEqualizerDialogVisible(true) }) {
                            Icon(
                                Icons.Default.GraphicEq,
                                contentDescription = "معدل الصوت",
                                tint = NeonViolet
                            )
                        }

                        IconButton(
                            onClick = { viewModel.onTabSelected(LibraryTab.QUEUE) },
                            modifier = Modifier.testTag("top_bar_queue_icon")
                        ) {
                            BadgedBox(
                                badge = {
                                    Badge(containerColor = ElectricCyan) {
                                        Text("${queue.size}", color = Color.Black, fontSize = 9.sp)
                                    }
                                }
                            ) {
                                Icon(
                                    Icons.Default.QueueMusic,
                                    contentDescription = "الطابور",
                                    tint = if (activeTab == LibraryTab.QUEUE) ElectricCyan else Color.White
                                )
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = DarkSurface
                    )
                )
            },
            bottomBar = {
                // Docked MiniPlayer when full player is collapsed
                if (currentTrack != null && !isFullPlayerExpanded) {
                    val progressFraction = if (durationMs > 0) (currentPosMs.toFloat() / durationMs.toFloat()) else 0f
                    Box(modifier = Modifier.navigationBarsPadding()) {
                        MiniPlayer(
                            track = currentTrack!!,
                            isPlaying = isPlaying,
                            progressFraction = progressFraction,
                            onTogglePlayPause = { playerManager.togglePlayPause() },
                            onSkipNext = { playerManager.skipToNext() },
                            onSkipPrevious = { playerManager.skipToPrevious() },
                            onClick = { viewModel.setFullPlayerExpanded(true) }
                        )
                    }
                }
            },
            containerColor = DarkObsidian
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                when {
                    selectedPlaylist != null -> {
                        PlaylistDetailView(
                            playlist = selectedPlaylist!!,
                            tracks = selectedPlaylistTracks,
                            currentTrackId = currentTrack?.id,
                            isPlaying = isPlaying,
                            onBack = { viewModel.closePlaylistDetail() },
                            onPlayAll = { viewModel.playAll(selectedPlaylistTracks) },
                            onAddAllToQueue = { selectedPlaylistTracks.forEach { playerManager.addToQueue(it) } },
                            onDeletePlaylist = { viewModel.deletePlaylist(selectedPlaylist!!.id) },
                            onTrackClick = { viewModel.playTrack(it) },
                            onPlayNext = { viewModel.playNext(it) },
                            onAddToQueue = { viewModel.addToQueue(it) },
                            onAddToPlaylist = { viewModel.openAddToPlaylistDialog(it) }
                        )
                    }
                    activeTab == LibraryTab.PLAYLISTS -> {
                        PlaylistsView(
                            playlists = playlists,
                            onCreatePlaylistClick = { viewModel.setCreatePlaylistDialogVisible(true) },
                            onPlaylistClick = { viewModel.openPlaylist(it) }
                        )
                    }
                    activeTab == LibraryTab.QUEUE -> {
                        QueueView(
                            queue = queue,
                            currentIndex = queueIndex,
                            isPlaying = isPlaying,
                            playerManager = playerManager,
                            onSaveAsPlaylist = { viewModel.saveCurrentQueueAsPlaylist(it) }
                        )
                    }
                    else -> {
                        LibraryView(
                            tracks = filteredTracks,
                            currentTrackId = currentTrack?.id,
                            isPlaying = isPlaying,
                            searchQuery = searchQuery,
                            activeTab = activeTab,
                            onSearchChange = { viewModel.onSearchQueryChanged(it) },
                            onTabSelected = { viewModel.onTabSelected(it) },
                            onOpenFilePicker = {
                                filePickerLauncher.launch(arrayOf("audio/*", "video/*"))
                            },
                            onAddStreamClick = { viewModel.setAddStreamDialogVisible(true) },
                            onShuffleAll = {
                                viewModel.playAll(filteredTracks.shuffled())
                            },
                            onTrackClick = { viewModel.playTrack(it) },
                            onPlayNext = { viewModel.playNext(it) },
                            onAddToQueue = { viewModel.addToQueue(it) },
                            onAddToPlaylist = { viewModel.openAddToPlaylistDialog(it) }
                        )
                    }
                }
            }
        }

        // Animated Full Screen Player Overlay
        AnimatedVisibility(
            visible = isFullPlayerExpanded && currentTrack != null,
            enter = slideInVertically(initialOffsetY = { it }),
            exit = slideOutVertically(targetOffsetY = { it })
        ) {
            currentTrack?.let { track ->
                FullPlayerScreen(
                    playerManager = playerManager,
                    currentTrack = track,
                    isPlaying = isPlaying,
                    currentPosMs = currentPosMs,
                    durationMs = durationMs,
                    visualizerBars = visualizerBars,
                    repeatMode = repeatMode,
                    isShuffle = isShuffle,
                    playbackSpeed = playbackSpeed,
                    audioPreset = audioPreset,
                    sleepTimerSeconds = sleepTimerSeconds,
                    videoResizeMode = videoResizeMode,
                    queueCount = queue.size,
                    onCollapse = { viewModel.setFullPlayerExpanded(false) },
                    onOpenQueue = {
                        viewModel.setFullPlayerExpanded(false)
                        viewModel.onTabSelected(LibraryTab.QUEUE)
                    },
                    onOpenEqualizer = { viewModel.setEqualizerDialogVisible(true) },
                    onOpenSleepTimer = { viewModel.setSleepTimerDialogVisible(true) },
                    onAddToPlaylist = { viewModel.openAddToPlaylistDialog(track) }
                )
            }
        }

        // Dialogs
        if (showCreatePlaylistDialog) {
            CreatePlaylistDialog(
                onDismiss = { viewModel.setCreatePlaylistDialogVisible(false) },
                onConfirm = { viewModel.createPlaylist(it) }
            )
        }

        if (trackToAddToPlaylist != null) {
            AddToPlaylistDialog(
                track = trackToAddToPlaylist!!,
                playlists = playlists,
                onDismiss = { viewModel.closeAddToPlaylistDialog() },
                onSelectPlaylist = { plId ->
                    viewModel.addTrackToPlaylist(plId, trackToAddToPlaylist!!)
                },
                onCreateNewPlaylist = {
                    viewModel.closeAddToPlaylistDialog()
                    viewModel.setCreatePlaylistDialogVisible(true)
                }
            )
        }

        if (showAddStreamDialog) {
            AddStreamDialog(
                onDismiss = { viewModel.setAddStreamDialogVisible(false) },
                onAdd = { url, title, isVideo ->
                    viewModel.addStreamUrl(url, title, isVideo)
                }
            )
        }

        if (showEqualizerDialog) {
            EqualizerDialog(
                currentPreset = audioPreset,
                onPresetSelected = { playerManager.setAudioPreset(it) },
                onDismiss = { viewModel.setEqualizerDialogVisible(false) }
            )
        }

        if (showSleepTimerDialog) {
            SleepTimerDialog(
                remainingSeconds = sleepTimerSeconds,
                onSetTimerMinutes = { playerManager.startSleepTimer(it) },
                onCancelTimer = { playerManager.cancelSleepTimer() },
                onDismiss = { viewModel.setSleepTimerDialogVisible(false) }
            )
        }
    }
}
