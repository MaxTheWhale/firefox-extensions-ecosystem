#Stakeholders
Browser extension users: The final users of our product, wrapped in other extensions
Cloud providers: Direct users of the API
Firefox developers: Possible users of the API
Rob Wu: Project director
Luca Greca: Project director

#Functional Requirements
1. Should be able to store and fetch datas from cloud.
2. Lift the cap of data that can be stored by 'storage.local'.
3. Should be an interface viable to all cloud providers, i.e. Google Drive, OneDrive, etc.
4. Should at least mimic functions currently exist in 'Browser.storage.local', potentially implement more features.
5. The repositary needs to be repeatedly accessable despite any situations happen to the system.

#Non-Functional Requirements
1. Needs to ensure secure data transmission.
2. Needs to be implemented using Javascript.
3. Minimise the operations needed between instructions given and doing the actual upload/download processes.
4. Require permission/confirmation from users when critical actions are called.
5. Plenty of explanations in code so that developers can understand it easier. 
