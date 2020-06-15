let profilePictures = document.querySelectorAll('.profile-image');
let editProfile = document.querySelector('#editProfile');
let deleteProfile = document.querySelector('.custom-file-upload.delete')
let currentProfile = editProfile.getAttribute('src');
let fileInput = document.querySelector('#profileImage');
let editProfileForm = document.querySelector('#editProfileForm');
let loader = document.querySelector('.loader');
let url = '/logbook/profile/edit/picture';

fileInput.addEventListener('change', function (e) {
    let formData = new FormData(editProfileForm);
    loader.style.display = 'block';
    editProfile.style.display = 'none';
    axios.put(url, formData).then(function (response) {
        let imageUrl = response.data.profilePicture;
        profilePictures.forEach(function (profilePicture) {
            profilePicture.setAttribute('src', imageUrl);
        });
        loader.style.display = 'none';
        editProfile.style.display = 'inline-block';
    }).catch(function (err) {
        console.log(err);
        loader.style.display = 'none';
        editProfile.style.display = 'inline-block';
    });
});

deleteProfile.addEventListener('click', function () {
    loader.style.display = 'block';
    editProfile.style.display = 'none';
    axios.put('/logbook/profile/delete/picture', {
        imageSrc: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    }).then(function (response) {
        let imageUrl = response.data.imageSrc;
        profilePictures.forEach(function (profilePicture) {
            profilePicture.setAttribute('src', imageUrl);
        });
        loader.style.display = 'none';
        editProfile.style.display = 'inline-block';
    }).catch(function (err) {
        console.log(err);
        loader.style.display = 'none';
        editProfile.style.display = 'inline-block';
    })
})