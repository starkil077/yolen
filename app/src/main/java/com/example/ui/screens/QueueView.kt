package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkAdd
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.PlaylistAdd
import androidx.compose.material.icons.filled.QueueMusic
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.MediaItemData
import com.example.player.PlayerManager
import com.example.ui.components.QueueItemCard
import com.example.ui.theme.DarkSurfaceHigh
import com.example.ui.theme.DarkSurfaceVariant
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.NeonViolet

@Composable
fun QueueView(
    queue: List<MediaItemData>,
    currentIndex: Int,
    isPlaying: Boolean,
    playerManager: PlayerManager,
    onSaveAsPlaylist: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var showSaveDialog by remember { mutableStateOf(false) }
    var playlistName by remember { mutableStateOf("") }

    if (showSaveDialog) {
        AlertDialog(
            onDismissRequest = { showSaveDialog = false },
            containerColor = DarkSurfaceVariant,
            title = {
                Text("حفظ الطابور كقائمة تشغيل", fontWeight = FontWeight.Bold, color = Color.White)
            },
            text = {
                Column {
                    Text(
                        "سيتم حفظ ${queue.size} مقاطع صوتية وفيديو في قائمة جديدة:",
                        fontSize = 13.sp,
                        color = Color.LightGray
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = playlistName,
                        onValueChange = { playlistName = it },
                        placeholder = { Text("اسم القائمة (مثال: طابور السهرة)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ElectricCyan,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth().testTag("save_queue_playlist_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onSaveAsPlaylist(playlistName)
                        showSaveDialog = false
                        playlistName = ""
                    },
                    enabled = playlistName.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan),
                    modifier = Modifier.testTag("confirm_save_queue_btn")
                ) {
                    Text("حفظ", color = Color(0xFF002229), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSaveDialog = false }) {
                    Text("إلغاء", color = Color.Gray)
                }
            }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("queue_view")
    ) {
        // Queue Header Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "طابور التشغيل (Queue)",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 20.sp
                    ),
                    color = Color.White
                )
                Text(
                    text = "${queue.size} مقاطع • تنقل وأعد الترتيب بحرية",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                    color = ElectricCyan
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (queue.isNotEmpty()) {
                    OutlinedButton(
                        onClick = { showSaveDialog = true },
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("save_queue_button")
                    ) {
                        Icon(
                            Icons.Default.BookmarkAdd,
                            contentDescription = null,
                            tint = NeonViolet,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("حفظ كقائمة", fontSize = 11.sp, color = Color.White)
                    }

                    OutlinedButton(
                        onClick = { playerManager.clearQueue() },
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("clear_queue_button")
                    ) {
                        Icon(
                            Icons.Default.DeleteSweep,
                            contentDescription = null,
                            tint = Color(0xFFFF5252),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("تفريغ", fontSize = 11.sp, color = Color(0xFFFF5252))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (queue.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.QueueMusic,
                        contentDescription = null,
                        tint = DarkSurfaceHigh,
                        modifier = Modifier.size(80.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "طابور التشغيل فارغ حالياً",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "اختر أي أغنية أو فيديو من المكتبة لإضافتها إلى الطابور!",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(queue) { index, track ->
                    val isCurrent = (index == currentIndex)
                    QueueItemCard(
                        track = track,
                        index = index,
                        isCurrentTrack = isCurrent,
                        isPlaying = isPlaying,
                        canMoveUp = index > 0,
                        canMoveDown = index < queue.lastIndex,
                        onClick = { playerManager.skipToQueueIndex(index) },
                        onMoveUp = { playerManager.moveQueueItem(index, index - 1) },
                        onMoveDown = { playerManager.moveQueueItem(index, index + 1) },
                        onRemove = { playerManager.removeFromQueue(index) }
                    )
                }
            }
        }
    }
}
