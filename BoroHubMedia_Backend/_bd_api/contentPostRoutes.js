const express = require("express");
const resource = require("../middlewares/mediaUploads");

const router = express.Router();

const ContentPostController = require("../controllers/contentPostController");

router.post("/create-content", resource.array("media", 4), (req, res) => {
  ContentPostController.createContentPost(req, res);
});

// create post with images
router.post(
  "/create-content-images/:memberId",
  resource.array("media", 10),
  (req, res) => {
    ContentPostController.createContentPostWithImages(req, res);
  }
);

// update post
router.put("/update-content/:postId", (req, res) => {
  ContentPostController.updateContentPost(req, res);
});

// get member posts
router.get("/get-content/:memberId", (req, res) => {
  ContentPostController.getContentController(req, res);
});
router.get(
  "/get-content/:memberId",
  (req, res) => ContentPostController.getContent
);

// like post
router.put("/like-content/:postId", (req, res) => {
  ContentPostController.likeContentPostController(req, res);
});

// unlike post
router.put("/unlike-content/:postId", (req, res) => {
  ContentPostController.unlikeContentPostController(req, res);
});
// delete post
router.delete("/delete-content/:postId", (req, res) => {
  ContentPostController.deleteContentPostController(req, res);
});

module.exports = router;
