package com.example.data

import com.example.data.dao.PlaylistDao
import com.example.data.dao.PlaylistWithItemCount
import com.example.data.entity.PlaylistEntity
import com.example.data.entity.PlaylistItemEntity
import com.example.model.MediaItemData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class PlaylistRepository(private val playlistDao: PlaylistDao) {

    val allPlaylists: Flow<List<PlaylistWithItemCount>> = playlistDao.getPlaylistsWithCount()

    fun getItemsForPlaylist(playlistId: Long): Flow<List<MediaItemData>> {
        return playlistDao.getItemsForPlaylist(playlistId).map { entities ->
            entities.map { entity ->
                MediaItemData(
                    id = entity.mediaId,
                    title = entity.title,
                    artist = entity.artist,
                    mediaUri = entity.mediaUri,
                    artworkUri = entity.artworkUri,
                    durationMs = entity.durationMs,
                    isVideo = entity.isVideo,
                    genre = entity.genre
                )
            }
        }
    }

    suspend fun createPlaylist(name: String): Long {
        val entity = PlaylistEntity(name = name)
        return playlistDao.insertPlaylist(entity)
    }

    suspend fun deletePlaylist(playlistId: Long) {
        playlistDao.deletePlaylistById(playlistId)
    }

    suspend fun addItemToPlaylist(playlistId: Long, track: MediaItemData, orderIndex: Int = 0) {
        val item = PlaylistItemEntity(
            playlistId = playlistId,
            mediaId = track.id,
            title = track.title,
            artist = track.artist,
            mediaUri = track.mediaUri,
            artworkUri = track.artworkUri,
            durationMs = track.durationMs,
            isVideo = track.isVideo,
            genre = track.genre,
            orderIndex = orderIndex
        )
        playlistDao.insertPlaylistItem(item)
    }

    suspend fun addItemsToPlaylist(playlistId: Long, tracks: List<MediaItemData>) {
        val items = tracks.mapIndexed { index, track ->
            PlaylistItemEntity(
                playlistId = playlistId,
                mediaId = track.id,
                title = track.title,
                artist = track.artist,
                mediaUri = track.mediaUri,
                artworkUri = track.artworkUri,
                durationMs = track.durationMs,
                isVideo = track.isVideo,
                genre = track.genre,
                orderIndex = index
            )
        }
        playlistDao.insertPlaylistItems(items)
    }

    suspend fun ensureDefaultPlaylistSeeded() {
        // Will be called to add sample favorites playlist if empty
    }
}
