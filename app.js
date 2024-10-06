const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));

const userDataFile = path.join(__dirname, 'users.json');
const listingsFile = path.join(__dirname, 'listings.json');

// Ensure files exist
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, JSON.stringify([]));
}

if (!fs.existsSync(listingsFile)) {
    fs.writeFileSync(listingsFile, JSON.stringify([]));
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'aboutus.html'));
});


// Registration route
app.get('/register', (req, res) => {
    res.render('registration');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync(userDataFile));
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.render('login', { error: 'Invalid email or password.' });
    }

    // Save user data in session
    req.session.user = {
        firstName: user.firstName,
        email: user.email,
        role: user.role
    };

    // Redirect to the appropriate dashboard based on the user's role
    if (user.role === 'seller') {
        res.redirect(`/dashboard-seller?firstName=${encodeURIComponent(user.firstName)}&email=${encodeURIComponent(user.email)}`);
    } else if (user.role === 'buyer') {
        res.redirect(`/dashboard-buyer?firstName=${encodeURIComponent(user.firstName)}&email=${encodeURIComponent(user.email)}`);
    } else if (user.role === 'agent') {
        res.redirect(`/dashboard-agent?firstName=${encodeURIComponent(user.firstName)}&email=${encodeURIComponent(user.email)}`);
    } else {
        res.render('login', { error: 'Unknown role. Please contact support.' });
    }
});

// Buyer Dashboard Route
app.get('/dashboard-buyer', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'buyer') {
        return res.redirect('/login');
    }
    const firstName = req.query.firstName;
    const listings = JSON.parse(fs.readFileSync(listingsFile));
    const { location, budget } = req.query;

    let filteredProperties = listings;

    if (location) {
        filteredProperties = filteredProperties.filter(property => property.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (budget) {
        filteredProperties = filteredProperties.filter(property => property.price <= parseFloat(budget));
    }

    res.render('dashboard-buyer', { user: { firstName }, properties: filteredProperties || [] });
});

// Seller Dashboard Route
app.get('/dashboard-seller', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'seller') {
        return res.redirect('/login');
    }
    const firstName = req.query.firstName;
    const userEmail = req.query.email;
    const listings = JSON.parse(fs.readFileSync(listingsFile));

    const sellerProperties = listings.filter(listing => listing.sellerEmail === userEmail);

    res.render('dashboard-seller', { user: { firstName }, properties: sellerProperties || [] });
});
// Agent Dashboard Route
app.get('/dashboard-agent', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'agent') {
        return res.redirect('/login');
    }
    
    const firstName = req.query.firstName;
    const users = JSON.parse(fs.readFileSync(userDataFile));
    const listings = JSON.parse(fs.readFileSync(listingsFile));
    
    const agent = users.find(user => user.email === req.session.user.email);
    
    // Fetch linked buyers and sellers
    const linkedBuyers = agent.linkedBuyers || [];
    const linkedSellers = agent.linkedSellers || [];
    const activeDeals = agent.activeDeals || [];
    
    // Fetch properties for sale
    const availableProperties = listings.filter(listing => listing.sellerEmail !== agent.email);
    
    res.render('dashboard-agent', {
        user: { firstName },
        linkedBuyers,
        linkedSellers,
        activeDeals,
        availableProperties
    });
});
;


// Add a new route for the dashboard overview
app.get('/dashboard', (req, res) => {
    const users = JSON.parse(fs.readFileSync(userDataFile));
    const listings = JSON.parse(fs.readFileSync(listingsFile));

    // Calculate number of buyers, sellers, and agents
    const numberOfSellers = users.filter(user => user.role === 'seller').length;
    const numberOfBuyers = users.filter(user => user.role === 'buyer').length;
    const numberOfAgents = users.filter(user => user.role === 'agent').length;

    res.render('dashboard', {
        numberOfSellers,
        numberOfBuyers,
        numberOfAgents,
        totalUsers: users.length,
        totalListings: listings.length,
    });
});



// Add Property (For Sellers)
app.post('/properties/add', (req, res) => {
    const { title, location, price, imageUrl } = req.body;
    const listings = JSON.parse(fs.readFileSync(listingsFile));
    const users = JSON.parse(fs.readFileSync(userDataFile));

    const sellerEmail = req.session.user.email;
    const seller = users.find(user => user.email === sellerEmail);

    if (!seller) {
        return res.render('dashboard-seller', { error: 'Seller not found. Please try again.' });
    }

    const newProperty = {
        title,
        location,
        price,
        imageUrl,
        sellerEmail: seller.email,
        sellerContact: seller.phone,
        savedBy: [],
        assignedAgent: null
    };

    listings.push(newProperty);
    fs.writeFileSync(listingsFile, JSON.stringify(listings, null, 2));

    res.redirect(`/dashboard-seller?email=${encodeURIComponent(seller.email)}`);
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
