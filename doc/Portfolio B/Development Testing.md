# Development Testing

As can be seen in the diagram in the previous section, our system will be split into three main sections. These being the HTML and CSS front end, the JavaScript file that will allow our system to be used as an API, and the back end JavaScript files that will handle the interactions with the various cloud storage providers (CSPs) and the main controller that decides which one to use.

## Front end
HTML and CSS can’t be tested beyond making sure it looks as intended. Upon integration with the rest of the system there will be functions that insert HTML during run-time, so tests could be run to ensure this works as intended; possibly by text matching. We can also test that using the interface created in this section that we can correctly add, select, edit, and remove cloud storage accounts from our system.

## API
We can test the JavaScript file that will allow our system to function as an API by treating the rest of the system as a black-box and ensuring that the main functions of our system work. These functions are: the ability to store a file on the selected CSP, the ability to retrieve a file from a selected CSP, the ability to see how much memory is being used, and the ability to remove a file from a selected CSP. Beyond this we can test that our system will also correctly handle data that is either invalid or that it is incapable of storing. Primarily we will do this by ensuring that the correct error messages are returned for a variety of problems such as trying to store a file in a storage space without enough room for it, trying to remove a non-stored item from storage, or trying to store a file when no storage provider has been selected.

## Back end
The JavaScript files that contain the code for connecting to the various CSPs and the main file which selects which file to use will be tested in much the same way as the second section was tested. The testing in this section will almost function as white-box tests of the second section, as the code in this section feeds up into the functions tested in the API file. First, we will unit test each of the individual files that connect to the different CSPs. To ensure they can all individually connect to a storage area for an account, add items, fetch items, delete items, see how much space is used, and properly reject if we attempt to use too much space. Then testing the main file will be an integration test of the previous units, ensuring that we can freely swap between accounts and that the correct storage provider is used for each account. We would then test that all the previous functions still worked correctly in a simulated scenario where we may perform a few operations on one account, swap accounts, perform more operations, swap accounts, etc.

## Frameworks
The testing frameworks we would use in the tests described above are: Black-box testing, White-box testing, Unit testing, and Integration testing.

## Challenges
There are two main issues that affect the testability of our system. The first is that as we are sending/receiving data over the internet we can’t reliably test the speed at which operations in the system are completed. The second, is that our system is primarily going to be used by external systems, so internal tests don’t necessarily guarantee it works correctly. However, we can solve this by simply creating an extension to test our system externally.
