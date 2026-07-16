import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid ID");
  }
  const filter = {};
  if (userId) {
    filter.owner = userId;
  }
  if (query) {
    filter.title = {
      $regex: query,
      $options: "i",
    };
  }
  const video = await Video.find(filter)
    .populate("owner", "username fullname avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "All videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video ,get thumbnail, upload to cloudinary, create video
  const { title, description } = req.body;
  const videoLocalPath = req.files?.videofile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!title.trim() || !description.trim()) {
    throw new ApiError(400, "Title and Description are required");
  }
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }
  const VideoURL = await uploadOnCloudinary(videoLocalPath);
  const ThumbnailURL = await uploadOnCloudinary(thumbnailLocalPath);
  if (!VideoURL) {
    throw new ApiError(404, "Video upload failed");
  }
  if (!ThumbnailURL) {
    throw new ApiError(404, "Thumbnail upload failed");
  }
  const storeVideo = await Video.create({
    title,
    description,
    videoFile: VideoURL.url,
    thumbnail: ThumbnailURL.url,
    duration: VideoURL.duration,
    owner: req.user._id,
    isPublished: true,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, storeVideo, "Video uploaded successfull"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  // valid // exist // get // found // ruturn
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ID");
  }
  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullname avatar",
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ID");
  }
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and Description are required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailUpload) {
    throw new ApiError(404, "Thumbnail upload failed");
  }
  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    { $set: { title, description, thumbnail: thumbnailUpload.url } },
    { new: true },
  );
  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  //TODO: delete video
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ID");
  }
  const DeleteVideo = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });
  if (!DeleteVideo) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, DeleteVideo, "Video delete successfull"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findOne({ _id: videoId, owner: req.user._id });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `video ${video.isPublished ? "published" : "unpublished"} successfully`,
      ),
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
