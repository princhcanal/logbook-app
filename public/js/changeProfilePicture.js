let profilePictures = document.querySelectorAll('.profile-image');
let editProfile = document.querySelector('#editProfile');
let currentProfile = editProfile.getAttribute('src');
let fileInput = document.querySelector('#profileImage');
let editProfileForm = document.querySelector('#editProfileForm');
let loader = document.querySelector('.loader');
let url = '/logbook/profile/edit/picture';

fileInput.addEventListener('change', (e) => {
    let formData = new FormData(editProfileForm);
    loader.style.display = 'block';
    editProfile.style.display = 'none';
    axios.put(url, formData).then(response => {
        let imageUrl = `/uploads/${formData.get('profilePicture').name}`;
        profilePictures.forEach(profilePicture => {
            profilePicture.setAttribute('src', imageUrl);
        });
        loader.style.display = 'none';
        editProfile.style.display = 'inline-block';
    }).catch(err => {
        console.log(err);
    });
    if (currentProfile === editProfile.getAttribute('src')) {
        loader.style.display = 'none';
        editProfile.style.display = 'inline-block';
    }
});