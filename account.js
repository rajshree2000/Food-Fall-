$(window).on('load', function() {
    setTimeout(function () {
        $("#loader").fadeOut("slow");
    }, 2000);
});

// Global - indicates if user is logged in or not
let loggedIn = false;

// These elements are used in preload.js so we must declare them globally for now
const logOutPanel = document.getElementById("log-out-main-menu");
const loginPanel = document.getElementById("login-panel");
const loginBox = document.getElementById("loginbox");
const signUpPanel = document.getElementById("signupbox");
const loginAlert = document.getElementById('login-alert');
const signUpAlert = document.getElementById('signupalert');

(function() {

    const config = {
        apiKey: "AIzaSyDLI2-ikgpZ8N4EX89enO8ERiMz63Rv7eo",
        authDomain: "fool-fall.firebaseapp.com",
        databaseURL: "https://fool-fall.firebaseio.com",
        projectId: "fool-fall",
        storageBucket: "fool-fall.appspot.com",
        messagingSenderId: "884200936745"
    };

    firebase.initializeApp(config);

    // Get DOM elements!
    const txtEmail = document.getElementById('txtEmail');
    const txtEmailSignUp = document.getElementById('txtEmailSignUp');
    const txtPassword = document.getElementById('txtPassword');
    const txtPasswordSignUp = document.getElementById('txtPasswordSignUp');
    const txtUserName = document.getElementById('txtUserName');
    const btnLogin = document.getElementById('btnLogin');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnLogOut = document.getElementById('btnLogOut');
    const btnLogOutMainMenu = document.getElementById('btnLogOutMainMenu');
    const goToSignUp = document.getElementById('goToSignUp');
    const signInLink = document.getElementById('signinlink');

    // Text area select on touch
    txtEmail.addEventListener('touchend', function() {
        this.focus();
        this.select();
    });
    txtPassword.addEventListener('touchend', function() {
        this.focus();
        this.select();
    });
    txtEmailSignUp.addEventListener('touchend', function() {
        this.focus();
        this.select();
    });
    txtPasswordSignUp.addEventListener('touchend', function() {
        this.focus();
        this.select();
    });
    txtUserName.addEventListener('touchend', function() {
        this.focus();
        this.select();
    });
    goToSignUp.addEventListener('touchend', function() {
        $('#loginbox').hide(); $('#signupbox').show();
    });
    signInLink.addEventListener('touchend', function() {
        $('#signupbox').hide(); $('#loginbox').show()
    });

    // Event listeners for LOGIN button
    btnLogin.addEventListener('click', signIn);
    btnLogin.addEventListener('touchend', signIn);
    function signIn() {
        // Get email and password fields
        const email = txtEmail.value;
        const password = txtPassword.value;
        const auth = firebase.auth();
        // Sign in
        const promise = auth.signInWithEmailAndPassword(email, password);
        promise.catch(e => {
            showLoginAlert();
        });
    }

    // Event listeners for SIGN-UP button
    btnSignUp.addEventListener('click', signUp);
    btnSignUp.addEventListener('touchend', signUp);
    function signUp() {
        // Get email and password fields
        // TODO: Check for REAL EMAIL
        const email = txtEmailSignUp.value;
        const password = txtPasswordSignUp.value;
        const userName = txtUserName.value;
        const auth = firebase.auth();
        // Sign up
        auth.createUserWithEmailAndPassword(email, password)
            .then(user => createUser(user, userName, email, password, 0))
            .catch(e => {
                showSignUpAlert();
            });
    }

    function createUser(user, name, email, pass, userScore) {
        if (user) {
            var rootRef = firebase.database().ref();
            var storesRef = rootRef.child('users/' + user.uid);
            storesRef.set({
                userName: name,
                email: email,
                password: pass,
                score: userScore
            });
        }
    }

    // Event listener for LOGOUT button
    btnLogOut.addEventListener('click', logOutMainMenu);
    btnLogOut.addEventListener('touchend', logOutMainMenu);
    // Event listener for LOGOUT button on the MAIN MENU
    btnLogOutMainMenu.addEventListener('click', logOutMainMenu);
    btnLogOutMainMenu.addEventListener('touchend', logOutMainMenu);
    function logOutMainMenu() {
        menuBuild = true;
        firebase.auth().signOut();
    }

    // Real-time user authentication
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            btnLogOut.classList.remove('hide');
            loggedIn = true;
            try {
                music.play();
                loginPanel.style.display = "none";
                signUpPanel.style.display = "none";
            } catch(exception) {
            }
            logOutPanel.style.display = "block";

            loginAlert.style.display = "none";
            loginAlert.innerHTML = "";
            displayScore(firebaseUser);

        } else {
            btnLogOut.classList.add('hide');
            try {
                music.pause();
                loggedIn = false;
                loginPanel.style.display = "block";
                logOutPanel.style.display = "none";
                loginBox.style.display = "block";
            } catch (exception) {
            }
        }
    });

}());

function displayScore(user) {
    var welcomeUserInfo = document.getElementById('welcomeUserInfo');
    var userInDatabase = database.ref("users/" + user.uid);
    // var welcomeUserInfo = database.ref("users/" + user.uid + "/userName");
    userInDatabase.on('value', function(userSnapshot) {
        welcomeUserInfo.innerHTML = "<p>Welcome <span class='inline-font'>" + userSnapshot.child("userName").val()
            + "</span>, your highscore is <span style='color: #12ff19;' class='inline-font'>" + userSnapshot.child("score").val() + "</span></p>";
    });
}


function showLoginAlert() {
    loginAlert.style.display = "block";
    loginAlert.innerHTML = "<p>Uh Oh! Unable to login. Are you sure that's your email and password?</p>";
}

function showSignUpAlert() {
    signUpAlert.style.display = "block";
    signUpAlert.innerHTML = "<p>Hmm, your email is improperly formatted. Can you make sure it's correct?</p>";
}
