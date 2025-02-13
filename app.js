var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var restaurantsRouter = require('./routes/restaurants');
var foodRouter = require('./routes/food');
var customersRouter = require('./routes/customers');
var ordersRouter = require('./routes/orders');
var chatRouter = require('./routes/chat');
var authmiddleware = require('./middlewares/auth');


const pg = require('./config/db');
var app = express();
var expressLayouts = require('express-ejs-layouts');

pg.connect(() => {console.log('connected')})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/restaurants', authmiddleware.authmiddleware, restaurantsRouter);
app.use('/food/restaurant_food', foodRouter);
app.use('/customers', customersRouter);
app.use('/orders', ordersRouter);
app.use('/chat', chatRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
