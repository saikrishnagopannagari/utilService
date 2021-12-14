

module.exports = {
    textValidation: (name) => name.trim().length === 0,
    passwordValidation: (password) => password.toString().length === 0,
    idValidation: (id) => id.toString().length === 0,
    oldPasswordValidation: (oldPassword) => oldPassword.toString().length === 0,
    emailValidation: (email) => email.toString().length === 0,
    mobileValidation: (mobile) => mobile.toString().length === 0,
    roleValidation: (role) => !['Only Work', 'Work + Material', 'Only Material'].includes(role),
    accountTypeValidation: (role) => !['Contractor', 'Supervisor', 'Admin', 'Finance', 'Project', 'BOQ'].includes(role),
}