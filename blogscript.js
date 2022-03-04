const firebaseConfig = {
    apiKey: "AIzaSyAbzl0zDpkSac-2v94zWpopKW7vNOOwMjg",
    authDomain: "haxkdb.firebaseapp.com",
    projectId: "haxkdb",
    storageBucket: "haxkdb.appspot.com",
    messagingSenderId: "117717862942",
    appId: "1:117717862942:web:6faa309539410f59ddfc0f",
    measurementId: "G-CRQLG1FWKS"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();


/*|||||||||||||||||||||||||||||||||||||||||||||||||
|        all Important Additional Functions       |
|||||||||||||||||||||||||||||||||||||||||||||||||*/

function toSeoUrl(url) {
    return url.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .replace(/&/g, '-and-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-*/, '')
        .replace(/-*$/, '');
}



function removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();
    return str.replace(/(<([^>]+)>)/ig, '');
}

function getSlug(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}



function generateDate() {
    const newDate = new Date();

    const date = newDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).replace(/[^0-9]/g, "");

    const time = newDate.getTime().toString();

    return date + time;
}

/*|||||||||||||||||||||||||||||||||||||||||||||||||
|        all Important Additional Functions       |
|||||||||||||||||||||||||||||||||||||||||||||||||*/


$("td").click(function () {
    console.log('cliked');
});

$(document).ready(() => {
    $('#adminLogin').click(() => {
        var Email = $('#Email').val();
        var Password = $('#Password').val();
        firebase.auth().signInWithEmailAndPassword(Email, Password).then(function () {
            alert('Login SuccessFully....!');
            var user = firebase.auth().currentUser;
            id = user.uid;
            sessionStorage.setItem('uid', id);
            window.location.replace("dashboard.html");
        }).catch(function (error) {
            var errorcode = error.code;
            var errormsg = error.message;
            alert(errormsg);
            console.log(error);
        });
    });


    $("#addBlog").click(() => {
        var blog_title = $('#blog_title').val();
        var blog_desc = $('#blog_desc').val();
        var blog_slug = toSeoUrl(blog_title) + "-" + Math.floor(Math.random() * 99999);
        var blog_date = generateDate();
        db.collection("haxkdblog").doc(blog_slug).set({
            blog_title: blog_title,
            blog_desc: blog_desc,
            blog_date: blog_date,
        })
            .then(() => {
                console.log("Document successfully written!");
                alert('Data Added SuccessFully....!');
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
                alert(error.message);
            });
    });

    $("#loadmore").click(()=>{
        var loader = '<div class="spin"><div class="spinner"></div></div>';
        $('#allPost').append(loader);
        var element = $("#loadmore");
        var records = element.attr('data-records');
        var limit = element.attr('data-limit');
        var total = parseInt(records) + parseInt(limit);
        getBlogData(total);
        element.attr('data-records',total);
    });


});

function checkAuthUser() {
    var uid = sessionStorage.getItem('uid');
    if (uid == null) {
        sessionStorage.setItem('notice', 'Please Login First');
        window.location.replace("index.html");
    }
}







function getBlogData(lmt=2) {
    let blogData = "";
    db.collection("haxkdblog").orderBy("blog_date", "desc").limit(lmt).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var blog_slug = doc.id;
            var blog_title = doc.data().blog_title;
            var blog_date = doc.data().blog_date;
            var blog_desc = doc.data().blog_desc;
            blog_desc = removeTags(blog_desc);
            blogData += `<!-- Post preview-->
                    <div class="post-preview">
                        <a href="post.html?blog=${blog_slug}">
                            <h2 class="post-title">${blog_title}</h2>
                        </a>
                        <p class="post-subtitle">${blog_desc.slice(0, 200)}...</p>
                    </div>
                    <!-- Divider-->
                    <hr class="my-4" />`;
            document.getElementById("allPost").innerHTML = blogData;
        });
    });
}


function getAPost() {
    var slug = getSlug('blog');
    if (slug == null) {
        window.location.replace("index.html");
        return
    }
    db.collection("haxkdblog").doc(slug).get().then((doc) => {
        if (!doc.exists) {
            window.location.replace("index.html");
            return
        } else {
            var blog_title = doc.data().blog_title;
            var blog_desc = doc.data().blog_desc;
            $("#blog_title").html(blog_title);
            $("#blog_desc").html(blog_desc);
            $('title').html('HAXKD BLOG | ' + blog_title);
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}


function getAdminAllBlog() {
    let blogData = "";
    db.collection("haxkdblog").orderBy("blog_date", "desc").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var blog_slug = doc.id;
            var blog_title = doc.data().blog_title;
            var blog_date = doc.data().blog_date;
            var blog_desc = doc.data().blog_desc;
            blog_desc = removeTags(blog_desc);
            blogData += `<tr><td><input value='${blog_slug}' class='form-control' readonly></td><td><input value='${blog_title}' class='form-control' readonly></td><td><textarea class='form-control' readonly rows=10 cols=50>${blog_desc}</textarea></td><td><button class='btn btn-info editBlog' onclick='editBlog(this)'>EDIT</button><button class='btn btn-success d-none saveBlog' onclick='saveBlog(this)'>SAVE</button></td><td><button class='btn btn-danger deleteBlog' onclick='deleteBlog(this)'>DELETE</button></td></tr>`;
            document.getElementById("allBlog").innerHTML = blogData;
        });
    });
}




var today = new Date();
$("#year").html(today.getFullYear());

function editBlog(a) {
    const blog_slug = a.parentElement.parentElement.cells[0].getElementsByTagName("input")[0];
    const blog_title = a.parentElement.parentElement.cells[1].getElementsByTagName("input")[0];
    const blog_desc = a.parentElement.parentElement.cells[2].getElementsByTagName("textarea")[0];
    const edit_btn = a.parentElement.parentElement.cells[3].getElementsByTagName("button")[0];
    const save_btn = a.parentElement.parentElement.cells[3].getElementsByTagName("button")[1];
    // blog_slug.toggleAttribute("readonly");
    blog_title.toggleAttribute("readonly");
    blog_desc.toggleAttribute("readonly");
    save_btn.classList.toggle('d-none');
    edit_btn.classList.toggle('d-none');
}


function saveBlog(a) {
    const blog_slug = a.parentElement.parentElement.cells[0].getElementsByTagName("input")[0];
    const blog_title = a.parentElement.parentElement.cells[1].getElementsByTagName("input")[0];
    const blog_desc = a.parentElement.parentElement.cells[2].getElementsByTagName("textarea")[0];
    const edit_btn = a.parentElement.parentElement.cells[3].getElementsByTagName("button")[0];
    const save_btn = a.parentElement.parentElement.cells[3].getElementsByTagName("button")[1];
    const blog_date = generateDate();

    // console.log(blog_slug.value);
    // console.log(blog_title.value);
    // console.log(blog_desc.value);
    // blog_slug.toggleAttribute("readonly");
    blog_title.toggleAttribute("readonly");
    blog_desc.toggleAttribute("readonly");
    save_btn.classList.toggle('d-none');
    edit_btn.classList.toggle('d-none');

    console.log(blog_title.value);
    db.collection("haxkdblog").doc(blog_slug.value).update({
        blog_title: blog_title.value,
        blog_desc: blog_desc.value,
        blog_date: blog_date,
    })
        .then(() => {
            alert("Document successfully updated!");
        })
        .catch((error) => {
            // The document probably doesn't exist.
            console.error("Error updating document: ", error);
            alert('something went wrong');
        });
}

function deleteBlog(a) {
    const blog_slug = a.parentElement.parentElement.cells[0].getElementsByTagName("input")[0].value;
    var result = confirm("Want to delete?");
    if (result) {
        db.collection("haxkdblog").doc(blog_slug).delete().then(() => {
            alert("Document successfully deleted!");
            getAdminAllBlog();
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }
}