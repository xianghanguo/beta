// Validators

import { Validators } from '@angular/forms';

export namespace Validator {

  export const emailValidator = ['', [
    Validators.minLength(5),
    Validators.required,
    Validators.pattern('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$')]
  ];
  export const passwordValidator = ['', [
    Validators.minLength(5),
    Validators.required,
    Validators.pattern('^[a-zA-Z0-9!@#$%^&*()_+-=]*$')]
  ];
  export const nicknameValidator = ['', [
    Validators.minLength(5),
    Validators.maxLength(12),
    Validators.required,
    Validators.pattern('^([a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D\u3131-\uD79D])*$')]
  ];
  
  export const profileNameValidator = {
    minLength: 5,
    lengthError: { title: 'Name Too Short!', subTitle: 'Sorry, but name must be more than 4 characters.' },
    pattern: /^[a-zA-Z0-9\s]*$/g,
    patternError: { title: 'Invalid Name!', subTitle: 'Sorry, but the name you entered contains special characters.' }
  };
  export const profileEmailValidator = {
    pattern: /^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/g,
    patternError: { title: 'Invalid Email Address!', subTitle: 'Sorry, but the email you have entered is invalid.' }
  };
  export const profilePasswordValidator = {
    minLength: 5,
    lengthError: { title: 'Password Too Short!', subTitle: 'Sorry, but password must be more than 4 characters.' },
    pattern: /^[a-zA-Z0-9!@#$%^&*()_+-=]*$/g,
    patternError: { title: 'Invalid Password!', subTitle: 'Sorry, but the password you have entered contains special characters.' }
  };
  
  // Group Form Validators
  export const groupNameValidator = ['', [Validators.required, Validators.minLength(1)]];
  export const groupDescriptionValidator = ['', [Validators.required, Validators.minLength(1)]];
}