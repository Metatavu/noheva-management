# noheva-management

## Steps to run
1. git submodule update --init
2. npm i
3. npm run dev

## Upgrading CKEditor

If CKEditor needs upgrading use CKEditor's builder tool to build new package: https://ckeditor.com/cke4/builder

Builder tool has option to upload existing build-config.js to create bundle with all previously selected plugins and features. Use build-config.js from public/ckditor/build-config.js to ensure that new build contains same features as the previous one.

After building new zip bundle, replace ckeditor folder from public -folder with one from the zip and you are done.

