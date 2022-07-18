import { Router } from 'express';
import { Category } from '../models/category';
import * as sqlite3 from "sqlite3";

const router = Router();

router.get('/categories', async (req, res, next) => {

    try{
        let db = new sqlite3.Database( "./db.sqlite");

        let sql = `SELECT * FROM categories`;

        db.all(sql, [], (err, rows: Category[]) => {
            if (err) {
                throw err;
            }
            rows = rows.map(r => {
                return {id : r.id, name: r.name} // just want to return this two params
            })
            db.close();
            res.status(200).json({ categories : rows });
        });

    }catch (err) {
        // @ts-ignore
        if (!err.statusCode) {
            // @ts-ignore
            err.statusCode = 500;
        }
        next(err);
    }

});



export default router;
