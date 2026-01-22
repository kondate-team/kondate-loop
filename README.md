CloudFormationテンプレートにおいての決まり事
・テンプレートで定義するresourceには必ずTagsをつける。KeyはOwner、Valueはyukanagatake
・テンプレートの初めに必ず、Parametersを定義する。内容は以下
Parameters:
  SystemId:
    Type: String
    Default: 'kondate-5036514'
    Description: SystemId
  Env:
    Type: String
    Default: 'dev'
    AllowedValues:
      - 'dev'
      - 'prod'
    Description: Environment
