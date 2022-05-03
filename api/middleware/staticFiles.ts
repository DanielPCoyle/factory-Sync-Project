import path from "path";
import express from "express";

export const staticFiles = (app:any) => {
  app.use('/__file__', express.static(path.resolve("./uploads")));
};
export default staticFiles;