# Requirements
## Stakeholders 
- Browser extension users: The final users of our product, wrapped in other extensions
- Cloud providers: Provide the cloud-storage services that our API will interface with
- Extension developers: Direct users of the API when developing extensions that interact with it
- Rob Wu and Luca Greca: Project directors, providing support and guidance during development of the product
- Mozilla: 

## Use-case Diagram
![Use-case Diagram](use_case_diagram.png)

## Flow Steps
### Storing a file to a cloud
#### Basic flow
1. Select a cloud service. 
2. Log in to the cloud service and get a token for verification.
3. Verify the token for authentication. 
4. Select a local file. 
5. Upload the file. 
6. Cloud server confirms action complete. 
7. Return a success message. 

#### Alternative flow
If the user has already logged in before and got the token, skip the first two steps. 

#### Exceptional flow
If the token fails to verify, ask for another log in. 

------------------------------------------

### Deleting a file from a cloud
#### Basic flow
1. Select a cloud service. 
2. Log in to the cloud service and get a token for verification.
3. Verify the token for authentication. 
4. Request the list of files saved on cloud. 
5. Select a file from the list. 
6. Select "delete file". 
7. Ask confirmation for deleting the file. 
8. Send delete request to cloud. 
9. Cloud confirms action complete.
10. Return a success message. 

#### Alternative flow
If the user has already logged in before and got the token, skip the first two steps. 

If the user selects "No" when confirming, halt the process. 

#### Exceptional flow
If the token fails to verify, ask for another log in. 

-----------------------------------------

### Fetching a file from a cloud
#### Basic flow
1. Select a cloud service. 
2. Log in to the cloud service and get a token for verification.
3. Verify the token for authentication. 
4. Request the list of files saved on cloud. 
5. Select a file from the list. 
6. Select "Download file". 
7. Send pull request to cloud. 
8. Cloud sends the file.

#### Alternative flow
If the user has already logged in before and got the token, skip the first two steps. 

#### Exceptional flow
If the token fails to verify, ask for another log in. 

## Requirements
### Functional Requirements
1.  Must allow users to authenticate with the cloud-provider.
1.	Must provide functions to store, fetch and delete files from the cloud storage.
1.  Must prevent extensions from interfering with the user's own files or files from other extensions.
1.	Must allow storing more than the 5MB limit currently offered by the `storage.local` API.
1.	The interface provided by the library should be entirely cloud-provider independent. Any differences between providers should be handled by the library.

### Non-Functional Requirements
1.	Should ensure secure data transmission.
2.	Should be implemented using Javascript.
3.	Should minimise the operations needed between instructions given and doing the actual upload/download processes.
4.	Require permission/confirmation from users when critical actions are called.
5.	Need plenty of explanations in code and/or maybe example codes so that developers can understand it easier. 
6. The solution should feel consistent with how other APIs in Firefox behave

