package com.example.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.example.data.entity.PlaylistEntity
import com.example.data.entity.PlaylistItemEntity
import kotlinx.coroutines.flow.Flow

data class PlaylistWithItemCount(
    val id: Long,
    val name: String,
    val createdAt: Long,
    val itemCount: Int
)

@Dao
interface PlaylistDao {
    @Query("""
        SELECT p.id, p.name, p.createdAt, COUNT(pi.id) as itemCount 
        FROM playlists p 
        LEFT JOIN playlist_items pi ON p.id = pi.playlistId 
        GROUP BY p.id 
        ORDER BY p.createdAt DESC
    """)
    fun getPlaylistsWithCount(): Flow<List<PlaylistWithItemCount>>

    @Query("SELECT * FROM playlists WHERE id = :playlistId")
    suspend fun getPlaylistById(playlistId: Long): PlaylistEntity?

    @Query("SELECT * FROM playlist_items WHERE playlistId = :playlistId ORDER BY orderIndex ASC, id ASC")
    fun getItemsForPlaylist(playlistId: Long): Flow<List<PlaylistItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylist(playlist: PlaylistEntity): Long

    @Query("DELETE FROM playlists WHERE id = :playlistId")
    suspend fun deletePlaylistById(playlistId: Long)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylistItem(item: PlaylistItemEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylistItems(items: List<PlaylistItemEntity>)

    @Query("DELETE FROM playlist_items WHERE id = :itemId")
    suspend fun deleteItemById(itemId: Long)

    @Query("DELETE FROM playlist_items WHERE playlistId = :playlistId")
    suspend fun clearPlaylistItems(playlistId: Long)
}
