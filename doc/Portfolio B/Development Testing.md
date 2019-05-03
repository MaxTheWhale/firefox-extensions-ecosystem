# Development Testing

As can be seen from the previous section, our API is primarily contained in one class. All of its functionality relies on the API's ability to communicate with external services that we have no control over. This situation has resulted in our unit tests primarily focusing on testing our system in isolation from these external services, while the integration tests ensure our system works correctly when communicating with these services.

## Testing API
When creating the tests for our API we have two strict sets of tests, in the form of our unit tests and our integration tests. The main reason for this separation was to ensure that the basic logic of our API could be verified without relying on the functionality of the external services it connects to.

## General Tests
In the following two sections, I will describe how we implemented our unit tests, and our integration tests. However, apart from the nature of how these tests handled our APIs reliance on an external service, the tests run by both of them are very similar. In both cases we ran a series of tests on our API to ensure that all the functionality we developed worked as intended. This functionality included: The ability to upload, download, delete, and overwrite a file, The ability to create and remove folders, The ability to list files and folders, and the ability to perform all of the tasks previous, but whilst restricted to a single folder in the storage space.

## Unit Tests
For our API to have any functionality at all, it requires communication with an external service, in this case in the forms of the OneDrive API and the Google Drive API. This caused an issue when it came to creating unit tests, as in order to test that the basic logic of our system was working, we couldn’t rely on our API managing to connect to these services, as we have no control over them and so if something were to go wrong on their end these unit tests would fail, where they would typically pass. To get around this we have made use of tools available when running a node instance to create mock requests and responses to and from these services, which are then supplied to our API to work with. Allowing us to test our system, in isolation from any external factors.
<br>The unit tests also produce a code coverage report, allowing us to see how much of our code is being tested, and any parts that are not being run during the tests. This means we can focus new tests on the currently untested sections of code.

## Integration Tests
As stated above the tests implemented in our integration tests, and our unit tests are practically identical. However, in our integration tests, instead of running our API in isolation with no external factors, we have our API communicating with the storage providers to perform its functions, whilst being running in the context of the Firefox web browser as an extension. This is done to ensure that our API can both handle communication with the external services, but also that it has no issues running in its target environment. 

## Frameworks
The only testing framework we have made use of is Jasmine, that allows us to create test specifications, these are run and then a report is auto-generated stating what errors occurred, if any did.

## Challenges
One of the biggest challenges we had to deal with when coming up with ways to test our API were described in the Unit Tests section. As we had to find a way to run the API we developed in isolation from any external systems, when the API itself is designed around interacting with them. As described above we solved this by making use of a tool that allowed us to interrupt requests from our API and provide fake responses. We also wanted a way to ensure that the tests we designed made sense and would pass when they should. In order to do this we created a mock storage provider that would mimic the intended functionality of our system, without actually connecting to any external services.

