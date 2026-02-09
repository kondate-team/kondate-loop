# Infra

AWS / CloudFormation のインフラ賁E��向け README、E

## 命名規則

- SystemId parameter default must be 'kondate-loop' in CloudFormation templates.

## Templates

- Dev templates: aws-resources/kondate-loop-iam-github-oidc-stack.yaml, aws-resources/kondate-loop-iam-LambdaExecutionRole-stack.yaml, aws-resources/kondate-loop-iam-stack.yaml, aws-resources/kondate-loop-backend-stack.yaml, aws-resources/kondate-loop-infra-stack.yaml.
- Prod templates: aws-resources/PROD/PRODkondate-loop-backend-stack.yaml, aws-resources/PROD/PRODkondate-loop-infra-stack.yaml.
- Default buckets (if vars unset): dev frontend kondate-loop-dev-s3-web-211669976488-ap-northeast-1, prod frontend kondate-loop-prod-s3-web-211669976488-ap-northeast-1, artifacts kondate-loop-infra-s3-artifacts-211669976488-ap-northeast-1.
- Backend stack names: dev kondate-loop-backend-stack, prod PRODkondate-loop-backend-stack.
- API Gateway starts with /v1/{proxy+} (Lambda proxy). After stabilization, expose major endpoints as explicit resources.
- Backend Lambda code bucket is created by infra stack and exported as ${SystemId}-${Env}-backend-code-bucket-name.

## リソース別の“現実的な命名”侁E

### 1) S3バケチE���E�ここだけ特別扱ぁE��奨�E�E

S3はグローバルでユニ�Eクが忁E��なので、候補Aに **uniq** を足す�Eが安�Eです、E

**`{app}-{env}-{scope}-s3-{name}-{accountId}-{region}`**

例！E

- `kondate-prod-web-s3-assets-123456789012-ap-northeast-1`

S3の命名制紁E��小文字�E63斁E��など�E�に合わせて、�E体を小文字に寁E��る�Eが一番ラクです、E([AWS ドキュメンチE(https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html?utm_source=chatgpt.com))

---

### 2) CloudFront�E�実�E“名前”を付けにくい�E�E

CloudFront Distributionは “リソース名”とぁE��より **IDで管琁E*されがちです、E

CloudFormationだと `Comment`�E�E28斁E��以冁E��を説明的に入れるのが定石です、E([AWS ドキュメンチE(https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-cloudfront-distribution-distributionconfig.html?utm_source=chatgpt.com))

- **Comment**�E�`kondate-prod-web-cf-assets`
- **Tag(Name)**�E�`kondate-prod-web-cf-assets`

    �E�EloudFrontはタグで見�Eける運用が現実的�E�E

---

### 3) API Gateway

- Rest API / HTTP API の “表示名 Eは比輁E��自由度があります（ただし変な記号を避けておけばOK�E�E
- **Stage吁E*は制紁E��あるので、ここ�E `dev/stg/prod` をそのまま採用が強ぁE��ぁE

    �E�スチE�Eジ名�E英数字�Eハイフン・アンダースコアのみ、最大128斁E��！E([AWS ドキュメンチE(https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html?utm_source=chatgpt.com))

おすすめ�E�E

- API名：`kondate-prod-api`
- Stage名：`prod`�E�E envと一致�E�E

---

### 4) Lambda�E�E4斁E��制限を絶対に意識！E

Lambda関数名�E「関数名だけ指定する場合�E **64斁E��E*制限」があるので、ここが一番長さで詰みめE��ぁE��す、E([AWS ドキュメンチE(https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html))

またCloudFormationでめE`FunctionName` を指定すると置き換え更新が絡むので、名前変更を前提にしなぁE��が安�Eです、E([AWS ドキュメンチE(https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-function.html))

おすすめフォーマット（短めE��！E

**`{app}-{env}-api-fn-{action}`**

例！E

- `kondate-prod-api-fn-get-menus`
- `kondate-prod-api-fn-put-menu`
- `kondate-prod-api-fn-list-recipes`

コチE��E

- `get-menus` みたいに **動詁E名詞で短ぁE*
- `lambda` とぁE��単語�E体�E不要E��Efn`で十�E�E�E
- 封E��増えるなら、`menu-` などドメインを�Eに付ける（候補C寁E���E�E

---

### 5) DynamoDB�E��E由度高め、でも揃える�E�E

DynamoDBのチE�Eブル名�E 3、E55斁E��で、英数字�Eアンダースコア・ハイフン・ドットが許容されます、E([AWS ドキュメンチE(https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html?utm_source=chatgpt.com))

とはぁE��全体統一のために **小文字＋ハイフン**で揁E��る�Eがおすすめ、E

例！E

- `kondate-prod-data-ddb-menus`
- `kondate-prod-data-ddb-users`





