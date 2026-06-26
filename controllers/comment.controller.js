import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  // get video id
  //   check videoid=null
  //check video id is valid hai ya nhi
  //get comments
  //   check comments
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const comments = await Comment.find({ video: videoId })
    .select("content createdAt")
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  if (comments.length === 0) {
    throw new ApiError(404, "No comments found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comment Fetched Successfull"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  //get video id
  //videoid != null
  //check in video id valid
  //get comment req.body
  //req.body != null
  //show commentbox me user name
  //or user avatar
  //comment
  //res
  const { content } = req.body;
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }
  if (!content?.trim()) {
    throw new ApiError(401, "comment is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video is not exist");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "owner",
    "username avatar",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Add comment successfull"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  // commentId
  //req.body se comment
  //updata krdo
  const { commentId } = req.params;
  const { comment } = req.body;
  if (!commentId) {
    throw new ApiError(402, "comment id is required");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(401, "Invalid commentId");
  }
  if (!comment.trim()) {
    throw new ApiError(402, "comment is required");
  }
  // const commentDoc = await Comment.findByIdAndUpdate({ _id: commentId },{ $set: comment }, );
  const IdComment = await Comment.findById(commentId);
  if (!IdComment) {
    throw new ApiError(404, "comment not exist");
  }

  if (IdComment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "You are not allowed to update this comment");
  }
  const updatecomment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content: comment },
    },
    { new: true },
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatecomment, "Comment update successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  //commentId
  // check commentId
  // check user Id
  //delete
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  // const commentdel = await Comment.findByIdAndDelete(commentId);
  const commentdel = await Comment.findById(commentId);

  if (!commentdel) {
    throw new ApiError(401, "Comment not found");
  }

  if (commentdel.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this comment");
  }
  await Comment.deleteOne({ _di: commentId });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Delete Sucessfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
