const helpers = {
  getMenu: function () {
    return `SELECT * FROM menu_items;`;
  },
  getMenu2pt0: function () {
    return `SELECT menu_items.id AS pizza_id, photo_url, menu_items.name AS pizza_name, menu_items.price AS menu_price, toppings.name AS topping_name, topping_categories.price AS topping_price, toppings.topping_category_id as ID
    FROM menu_items
    LEFT JOIN menu_item_toppings ON menu_items.id = menu_item_id
    LEFT JOIN toppings ON menu_item_toppings.topping_id = toppings.id
    LEFT JOIN topping_categories ON topping_category_id = topping_categories.id;`;
  },
  getMenuItemFromId: function () {
    return `SELECT * FROM menu_items WHERE id = $1;`;
  },
  getToppings: function () {
    return `SELECT * FROM toppings;`;
  },
  getToppings2pt0: function () {
    return `SELECT topping_category_id, toppings.name AS name, topping_categories.name AS type
    FROM toppings
    LEFT JOIN topping_categories ON toppings.topping_category_id = topping_categories.id;`;
  },
  getToppingFromId: function () {
    return `SELECT * FROM toppings WHERE id = $1;`;
  },
  getPizzasInOrder: function () {
    return `SELECT quantity, menu_items.price, menu_items.name AS pizza_name, sizes.name AS size, order_items.id AS order_id
      FROM order_items
      JOIN orders ON orders.id = order_id
      JOIN menu_items ON menu_item_id = menu_items.id
      JOIN sizes ON sizes.id = size_id
      WHERE orders.id = $1;`;
  },
  countPizzasInOrder: function () {
    return `SELECT sum(quantity)
      FROM order_items
      JOIN orders ON orders.id = order_id
      WHERE orders.id = $1;`;
  },
  sumOfPizzasInOrder: function () {
    return `SELECT sum(price * quantity)
      FROM order_items
      JOIN orders ON orders.id = order_id
      JOIN menu_items ON menu_item_id = menu_items.id
      WHERE orders.id = $1`;
  },
  getToppingsOnOrderItem: function () {
    return `SELECT menu_items.name, toppings.name, topping_categories.price
      FROM menu_items
      JOIN order_items ON menu_item_id = menu_items.id
      JOIN order_item_toppings on order_item_id = order_items.id
      JOIN toppings ON topping_id = toppings.id
      JOIN topping_categories ON topping_category_id = topping_categories.id
      WHERE order_items.id = $1;`;
  },
  sumToppingsOnOrderItem: function () {
    return `SELECT sum(topping_categories.price)
      FROM menu_items
      JOIN order_items ON menu_item_id = menu_items.id
      JOIN order_item_toppings on order_item_id = order_items.id
      JOIN toppings ON topping_id = toppings.id
      JOIN topping_categories ON topping_category_id = topping_categories.id
      WHERE order_items.id = $1;`;
  },
  sumToppingsOnWholeOrder: function () {
    return `SELECT sum(topping_categories.price)
      FROM menu_items
      JOIN order_items ON menu_item_id = menu_items.id
      JOIN orders ON orders.id = order_id
      JOIN order_item_toppings on order_item_id = order_items.id
      JOIN toppings ON topping_id = toppings.id
      JOIN topping_categories ON topping_category_id = topping_categories.id
      WHERE orders.id = $1;`;
  },
  getAllOrders: function () {
    return `SELECT orders.*, customers.name, customers.phone_number
    FROM orders
    JOIN customers ON customer_id = customers.id
    ORDER BY pickup_time;`;
  },
  getDefaultToppings: function () {
    return `SELECT toppings.name, menu_items.price AS default_price, menu_items.id AS pizza_id, menu_items.photo_url AS url
    FROM menu_items
    LEFT JOIN menu_item_toppings ON menu_items.id = menu_item_id
    JOIN toppings ON toppings.id = topping_id
    WHERE menu_items.name = $1;`;
  },
  getOrderDetails: function () {
    return `SELECT quantity, orders.id, menu_items.price, menu_items.name AS pizza_name, sizes.name AS size, order_items.id AS order_id, toppings.name AS topping
    FROM order_items
    JOIN orders ON orders.id = order_id
    JOIN menu_items ON menu_item_id = menu_items.id
    JOIN sizes ON sizes.id = size_id
    JOIN order_item_toppings ON order_item_id = order_items.id
    JOIN toppings ON topping_id = toppings.id
    WHERE orders.id = $1;`;
  },
  getCustomerDetails: function () {
    return `SELECT *
    FROM customers
    WHERE id = $1;`;
  },
  getNotDefaultToppings: function () {
    return `SELECT toppings.name, topping_categories.price
    FROM toppings 
    JOIN topping_categories ON topping_categories.id = topping_category_id
    WHERE toppings.name NOT IN (

    SELECT toppings.name AS included_toppings
    FROM menu_items
    LEFT JOIN menu_item_toppings ON menu_items.id = menu_item_id
    JOIN toppings ON toppings.id = topping_id
    WHERE menu_items.name = $1);`
  },
  getPhotos: function () {
    return `SELECT id, photo_url
    FROM menu_items;`
  }
};

module.exports = { helpers };
