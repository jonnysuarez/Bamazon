var mysql = require("mysql");
var inquirer = require("inquirer");
//connect to mysql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    displayProducts();
});
//function to display products in "products" database table
function displayProducts() {
    console.log("Updating...");
    connection.query("SELECT * FROM products",
        function (err, rows) {
            if (err) throw err;
            console.log("GREAT STUFF FOR SALE!!")
            console.log("--------------------------")
            for (var i = 0; i < rows.length; i++) {
                console.log(rows[i].item_id, rows[i].product_name, rows[i].price);
            };
            console.log("--------------------------")
            itemQuery();
        }
    )
};
//Function to ask if the customer would like to shop again.
function restartQuery() {
    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to order again?",
            choices: ["YES", "NO"],
            name: "choice"
        },
    ]).then(function (inquirerResponse) {
        if (inquirerResponse.choice == "YES") {
            displayProducts();
        } else {
            console.log("Thanks for shopping with us!");
        }
    });
}
//Function to show and run the store.
function itemQuery() {
    inquirer.prompt([
        {
            type: "input",
            message: "What item would you like to buy?",
            name: "item_id"
        },
        {
            type: "input",
            message: "How many would you like?",
            name: "amount"
        }
    ]).then(function (inquirerResponse) {
        var item = inquirerResponse.item_id;
        var amount = inquirerResponse.amount;
        var dbItem = connection.query("SELECT * FROM products WHERE item_id = ?",
            [item],
            function (err, response) {
                //console.log(response)
                if (err) throw err;
                if (amount <= response[0].stock_quantity) {
                    var query = connection.query( "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: (response[0].stock_quantity - amount)
                            },
                            {
                                item_id: item
                            }
                        ],
                        function (err, res) {
                            if (err) throw err;
                            console.log("Order total cost: $" + response[0].price * amount);
                        }
                    );
                    setTimeout(restartQuery, 1000);
                } else {
                    console.log("We're sorry that item is currently out of stock!");
                    setTimeout(restartQuery, 1000);
                }
            }
        );
    })
}
