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

            //level1 : returning all categories
            const firstLevel = rows.map(r => {
                return {id : r.id, name: r.name} // just want to return this two params
            })

            //level2 : Adding the `children` attribute to the existing GET endpoint :

            let secondLevel = rows;
            secondLevel.forEach(r => {
                   r.children =  rows.filter(row=> row.parent_id && row.parent_id === r.id).map(r => {
                       return {id : r.id, name: r.name} // just want to return this two params
                   })

            });

            secondLevel = secondLevel.map(r => {
                return {id : r.id, name: r.name, children: r.children} // just want to return this three params
            })



            db.close();




            res.status(200).json({
                allCategories : firstLevel,
                categoriesWithChildren : secondLevel
            });

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
