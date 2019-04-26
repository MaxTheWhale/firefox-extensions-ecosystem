# Requirements
## Stakeholders 
- Browser extension users: The final users of our product, wrapped in other extensions
- Cloud providers: Direct users of the API
- Firefox developers: Possible users of the API
- Rob Wu: Project director
- Luca Greca: Project director

## Use-case Diagram
![use-case diagram](use-case%20diagram.jpg)

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
1.	Shall provide functions to store, delete and fetch files from cloud.
2.	Shall lift the cap of data that can be stored by 'storage.local'.
3.	Shall be an interface viable to all cloud providers, i.e. Google Drive, OneDrive, etc.
4.	Shall at least mimic functions currently exist in 'Browser.storage.local', potentially implement more features.
5.	The repository needs to be repeatedly accessible despite any situations happen to the system.
6.  Shall proceed an authentication check before making any actions to the cloud.

### Non-Functional Requirements
1.	Should ensure secure data transmission.
2.	Should be implemented using Javascript.
3.	Should minimise the operations needed between instructions given and doing the actual upload/download processes.
4.	Require permission/confirmation from users when critical actions are called.
5.	Need plenty of explanations in code and/or maybe example codes so that developers can understand it easier. 
6. The solution should feel consistent with how other APIs in Firefox behave

