const express = require("express");

const createFileUrl = (filename) => {
  return `${process.env.UPLOADS_BASE_URL}/media/images/${filename}`;
};

module.exports = { createFileUrl };
