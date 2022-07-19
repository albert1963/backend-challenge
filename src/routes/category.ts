import { Router } from 'express';
import {Category, CategoryClosure} from '../models/category';
import * as sqlite3 from "sqlite3";

const router = Router();

router.get('/categories', async (req, res, next) => {

    try{
        let db = new sqlite3.Database( "./db.sqlite");

        const sql = `SELECT * FROM categories`;

        db.all(sql, [], (err, rows: Category[]) => {
            if (err) {
                throw err;
            }

            //level1 : returning all categories
            const firstLevel = rows.map(r => {
                return {id : r.id, name: r.name} // just want to return this two params
            })

            //level2 : Adding the `children` attribute to the existing GET endpoint :
            let secondLevel = rows; //initialise with the row certainly affected by the previous queries
            secondLevel.forEach(r => {
                r.children =  rows.filter(row=> row.parent_id && row.parent_id === r.id).map(r => {
                    return {id : r.id, name: r.name} // just want to return this two params
                })

            });

            secondLevel = secondLevel.map(r => {
                return {id : r.id, name: r.name, children: r.children} // just want to return this three params
            });


            //level3 Adding Ancestors to return value
            // firstly, let's query the categories_closure table
            const sql2 = `SELECT * FROM categories c JOIN categories_closure ca WHERE c.id = ca.descendant_id`;

            db.all(sql2, [], (err2, catClosure: CategoryClosure[]) => {
                if (err2) {
                    throw err2;
                }

                let thirdLevel = rows; //initialise with the row certainly affected by the previous queries
                thirdLevel.forEach(t => {
                    const findInClosure = catClosure.filter(c => c.descendant_id === t.id);

                    //foreach row in the category closure, let's findout the ascendant data related to the ancestor_id
                    const ascendants: Category[] = [];
                    findInClosure.forEach(fic => {
                        if(fic.ancestor_id !== t.id){ // the current category must not be his proper ancestor
                            const result = rows.filter(r => r.id === fic.ancestor_id);

                            if(result[0])
                                ascendants.push(result[0]);
                        }

                    });

                    t.ancestors = ascendants.map((r => {
                        return {id : r.id, name: r.name}
                    })) //we just need the id and the name in the ancestor data
                })

                thirdLevel = thirdLevel.map(r => {
                    return {id : r.id, name: r.name,  ancestors: r.ancestors, children: r.children}
                });

                db.close();




                res.status(200).json({
                    allCategories : firstLevel,
                    categoriesWithChildren : secondLevel,
                    categoriesWithAncestors : thirdLevel
                });

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
