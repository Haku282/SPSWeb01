const authRouter = require('./auth');
const productRouter = require('./product');
const historyActivityRouter = require('./history_activity');
const product_categoryRouter = require('./product_category');
const dashboardRouter = require('./dashboard');
const adminRouter = require('./admin');
const chatRouter = require('./chat');
const importRouter = require('./import_batch');
const exportRouter = require('./export_batch');
const unitRouter = require('./unit');
const userRouter = require('./user');
const user_historyRouter = require('./user_history');
const supplierRouter = require('./supplier');
const errorTrackingRouter = require('./error_tracking');

function route(app) {
    
    app.use('/api/auth', authRouter);
    app.use('/api/product', productRouter);
    app.use('/api/product_category', product_categoryRouter);
    app.use('/api/history_activity', historyActivityRouter);
    app.use('/api/dashboard', dashboardRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/chat', chatRouter);
    app.use('/api/import_batch', importRouter);
    app.use('/api/export_batch', exportRouter);
    app.use('/api/supplier', supplierRouter);
    app.use('/api/unit', unitRouter);
    app.use('/api/user', userRouter);
    app.use('/api/user_history', user_historyRouter);
    app.use('/api/error_tracking', errorTrackingRouter);


}

module.exports = route;