## AWS Configuration

### IAM User
Create an IAM User by going to the IAM service.
Click on "Users" and then "Add user."
Provide a username and select "Programmatic access" as the access type.
Set permissions either by attaching existing policies or creating a custom policy.

#### Access Key & Access Secret Key
View the newly created user and click "Create Access Key".  Copy both the access key and access secret key.


#### Permissions
Create a new user group and add the AdministratorAccess permission.

Add the user to the new group.

#### AWS SDK configuration
Create a shared credentials file at `~/.aws/credentials` 
``` 
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

Set environment variables on your system (bash profile)
```
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
```

#### Verify things work
You should now be able to run `npm run dev` and sst will deploy to aws.

You should see output similar to:
``` 
SST v2.43.7  ready!

➜  App:     homethrive-lambda-crud
   Stage:   jason
   Console: https://console.sst.dev/local/homethrive-lambda-crud/jason

✔ Deploying bootstrap stack, this only needs to happen once
|  Default PUBLISH_ASSETS_COMPLETE 
|  Default site/Parameter_url AWS::SSM::Parameter CREATE_COMPLETE 
|  Default site/ServerFunctionRole AWS::IAM::Role CREATE_COMPLETE 
|  Default CustomResourceHandler/ServiceRole AWS::IAM::Role CREATE_COMPLETE 
|  Default LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole AWS::IAM::Role CREATE_COMPLETE 
|  Default CustomResourceHandler AWS::Lambda::Function CREATE_COMPLETE 
|  Default site/ServerFunction/AssetReplacerPolicy AWS::IAM::Policy CREATE_COMPLETE 
|  Default LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy AWS::IAM::Policy CREATE_COMPLETE 
|  Default site/ServerFunction/AssetReplacer Custom::AssetReplacer CREATE_COMPLETE 
|  Default LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a AWS::Lambda::Function CREATE_COMPLETE 
|  Default site/ServerFunction/ServerFunction AWS::Lambda::Function CREATE_COMPLETE 
|  Default site/ServerFunction/ServerFunction/LogRetention Custom::LogRetention CREATE_COMPLETE 
|  Default AWS::CloudFormation::Stack CREATE_COMPLETE 

✔  Deployed:
   Default

➜  Start Next.js: cd packages/web && npm run dev

```

### Stacks Console
So that you can view logs from various environments, including local, go to https://console.sst.dev/ and create an account, and link it to your aws account.

Go through the sst console stack creation process in AWS CloudFormation.
