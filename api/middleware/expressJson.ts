import express from 'express';
export default (app:any) =>{
  app.use(express.json());
}
