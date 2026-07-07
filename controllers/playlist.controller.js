import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  // get name and description from req.body
  // get userId from req.user._id
  // check if name is provided or description is provided, if not throw error
  // create playlist and return it
  const { name, description } = req.body;
  const userId = req.user._id;
  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  // get userId from req.user._id
  // get playlists video form database and findByid or populate and return it
  const playlists = await Playlist.find({
    owner: req.user._id,
  }).populate("videos", "title thumbnail views createdAt");
  if (playlists.length === 0) {
    throw new ApiError(404, "No playlists found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully"),
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  //TODO: get playlist by id
  // get playlistId from req.params
  // find playlist by id and populate videos and return it
  // check if playlist exists, if not throw error
  // return playlist
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const playlist = await Playlist.findById(playlistId).populate(
    "videos",
    "title thumbnail views createdAt",
  );
  if (playlist === null) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  //TODO: add video to playlist
  // get playlistId and videoId from req.params
  // check if playlistid and videoId exists, if not throw error
  // check if video is already in playlist, if yes throw error
  // add video to playlist and return updated playlist
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id");
  }
  const alreadyExists = await Playlist.findOne({
    _id: playlistId,
    videos: videoId,
  });
  if (alreadyExists) {
    throw new ApiError(400, "video already exists in playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true },
  ).populate("videos", "title thumbnail views createdAt");
  if (updatedPlaylist === null) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully",
      ),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // TODO: remove video from playlist
  // get playlistId and videoId from req.params
  // check if playlistid and videoId exists, if not throw error
  // check if video is already in playlist, if not throw error
  // remove video from playlist and return updated playlist
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video id");
  }
  const alreadyExists = await Playlist.findOne({
    _id: playlistId,
    videos: videoId,
  });
  if (!alreadyExists) {
    throw new ApiError(400, "video does not exist in playlist");
  }
  const updatedPlayList = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true },
  ).populate("videos", "title thumbnail views createdAt");
  if (updatedPlayList === null) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlayList,
        "Video removed from playlist successfully",
      ),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // TODO: delete playlist
  //   get playlistId from req.params
  // check if playlistid exists, if not throw error
  // delete playlist and return success message
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const deletedPlaylist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });
  if (deletedPlaylist === null) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist
  // get playlistId from req.params
  // get name and description from req.body
  // check if playlistid exists, if not throw error
  // check if name or description is provided, if not throw error
  // update playlist and return updated playlist
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { name, description },
    { new: true },
  ).populate("videos", "title thumbnail views createdAt");
  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
