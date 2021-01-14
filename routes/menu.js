/*
 * All routes for Menu are defined here
 * Since this file is loaded in server.js into api/menu,
 *   these routes are mounted onto /menu
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
const express = require("express");
const router = express.Router();
const { helpers } = require("../db/query-scripts/queryMethods.js");
const { menuBuilder, pizzaEditor, checkoutOrder } = require("../db/query-scripts/menu-queries.js");
const { generateRandomId } = require('../generateRandomId');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

module.exports = (db) => {

  router.get("/", (req, res) => {
    db.query(helpers.getMenu2pt0())
      .then((data) => {
        const templateVars = {
          result: menuBuilder(data.rows),
        };
        res.render("menu", templateVars);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.message });
      });
  });

  // shows the 'selected' menu item and options INSERT into orders

  router.get("/edit", (req, res) => {
    db.query(helpers.getToppings2pt0())
      .then((data) => {
        const templateVars = {
          result: pizzaEditor(data.rows),
        };
        console.log(templateVars);
        res.render("edit", templateVars);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  router.get("/edit/:name", (req, res) => {
    db.query(helpers.getToppings2pt0())
      .then((data) => {

        const templateVars = {
          result: pizzaEditor(data.rows),
          cart: req.cookies["cart"],
          selectedPizza: req.params.name
        };
        console.log("GET//:name=======>", data.rows);
        res.render("edit-name", templateVars);

      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  /*   router.get("/", (req, res) => {
      res.render("");
      db.query(`SELECT * FROM toppings;`)
        .then((data) => {
          const result = data.rows;
          res.json({ result });
        })
        .catch((err) => {
          res.status(500).json({ error: err.message });
        });
    }); */
  // see and remove orders item
  // option to  => get'/'
  router.get("/cart", (req, res) => {
    db.query(helpers.getPizzasInOrder(), ["1"])
      .then((data) => {
        const result = data.rows;
        res.render("cart", { result });
      })


      /*       const templateVars = {
        result: checkoutOrder(data.rows),
        cart: req.cookies["cart"],
      };
      console.log("GET/cart=======>",data.rows)
      res.render("cart", templateVars);
    }) */



      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.message });
      });
  });
  // checkout confirmation
  router.get("/checkout", (req, res) => {
    db.query(`SELECT * FROM orders;`)
      .then((data) => {
        const result = data.rows;
        res.render("checkout", { result });
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // option to chng_quantity/remove => post'/cart'
  // router.post("/cart", (req, res) => {
  //   db.query(`SELECT * FROM order_items;`)
  //     .then((data) => {
  //       const id = generateRandomId();
  //       const result = data.rows;
  //       const templateVars = { result, id, cart: req.session.cart };
  //       // res.json({ result });
  //       res.json({ result });
  //       res.render('cart', templateVars);
  //     })
  //     .catch((err) => {
  //       res.status(500).json({ error: err.message });
  //     });
  // });

  // checkout confirmation
  router.post("/checkout", (req, res) => {

    ////order id need to be fixed to actual id number
    const cart = {
      i7k4aA: {
        pizzas:
          [
            {
              id: 1,
              name: "Pepperoni Pizza",
              size: "small",
              toppings: ["Mozzarella", "Pepperoni", "Jalepeno's"],
              quantity: 1,
              price: 14,
            },
            {
              id: 2,
              name: "Pepperoni Pizza2",
              size: "medium",
              toppings: ["Mozzarella", "Pepperoni", "Jalepeno's"],
              quantity: 2,
              price: 5,
            },
          ],
        total: 30,
      }
    };
    const parseCart = cart[Object.keys(cart)[0]];

    db.query(`
    INSERT INTO orders ( customer_id, restaurant_id)
    VALUES ( $1, $2 ) RETURNING *
    ;`, [1, 1])
      .then((data) => {
        const result = data.rows;
        console.log(data.rows);
        const promises = [];
        for (let pizza of parseCart.pizzas) {
          const query = `INSERT INTO order_items ( order_id, menu_item_id, quantity)
          VALUES ( $1, $2, $3);`;
          const promise = db.query(query, [data.rows[0].id, pizza.id, pizza.quantity]);
          promises.push(promise);
        }
        Promise.all(promises).then(() => {
          res.send("ok");

        });


        /* res.render("checkout", { result }); */
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });



  router.post("/cart", (req, res) => {

    db
      .query(helpers.getDefaultToppings(), [req.body.pizza])
      .then(data => {

        const defaultToppings = data.rows;

        pizzaId = generateRandomId();

        const pizza = {
          id: pizzaId,
          name: req.body.pizza,
          size: "small",
          toppings: defaultToppings.map(topping => topping.name),
        };

        /*
          IF USER ALREADY HAS A CART IN THEIR COOKIES, USE THE EXISTING CART
          ELSE CREATE A CART AND STORE THE CART ID AND THE
          CART ITSELF AS COOKIES IN THE BROWSER
        */
        if (req.cookies["cartId"]) {

          cart = req.cookies["cart"];
          cart[req.cookies['cartId']]["pizzas"].push(pizza);

          res.cookie("cart", cart);

        } else {

          cartId = generateRandomId();

          cart = {};
          cart[cartId] = {};

          const pizzas = [];
          pizzas.push(pizza);

          cart[cartId]["pizzas"] = pizzas;

          res.cookie("cartId", cartId);
          res.cookie("cart", cart);
        }

        res.render("cart", req.cookies["cart"]);

      });
  });

  return router;
};
