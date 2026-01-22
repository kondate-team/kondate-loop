# CloudFormationテンプレートの決まり事

- テンプレートで定義するresourceには必ずTagsを付ける（Key: `Owner`, Value: `yukanagatake`）。
- テンプレートの先頭に必ずParametersを定義する。

```yaml
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
```
