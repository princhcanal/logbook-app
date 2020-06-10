let profilePictures = document.querySelectorAll('.profile-image');
let fileInput = document.querySelector('#profileImage');
let editProfileForm = document.querySelector('#editProfileForm');
let url = '/logbook/profile/edit/picture';

fileInput.addEventListener('change', (e) => {
    let formData = new FormData(editProfileForm);
    axios.put(url, formData).then(response => {
        let imageUrl = `/uploads/${formData.get('profilePicture').name}`;
        profilePictures.forEach(profilePicture => {
            profilePicture.setAttribute('src', imageUrl);
        })
    }).catch(err => {
        console.log(err);
    });
});