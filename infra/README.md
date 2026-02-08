# Infra

AWS / CloudFormation 縺ｮ繧､繝ｳ繝輔Λ雉・肇蜷代￠ README縲・

## 蜻ｽ蜷崎ｦ丞援

- SystemId parameter default must be 'kondate-loop' in CloudFormation templates.

## Templates

- Dev templates: aws-resources/kondate-loop-iam-github-oidc-stack.yaml, aws-resources/kondate-loop-iam-LambdaExecutionRole-stack.yaml, aws-resources/kondate-loop-iam-stack.yaml, aws-resources/kondate-loop-backend-stack.yaml, aws-resources/kondate-loop-infra-stack.yaml.
- Prod templates: aws-resources/PROD/PRODkondate-loop-backend-stack.yaml, aws-resources/PROD/PRODkondate-loop-infra-stack.yaml.
- Default buckets (if vars unset): dev frontend kondate-loop-dev-s3-web-211669976488-ap-northeast-1, prod frontend kondate-prod-s3-web-211669976488-ap-northeast-1, artifacts kondate-loop-infra-s3-artifacts-211669976488-ap-northeast-1.
- Backend stack names: dev kondate-loop-backend-stack, prod PRODkondate-loop-backend-stack.

## 繝ｪ繧ｽ繝ｼ繧ｹ蛻･縺ｮ窶懃樟螳溽噪縺ｪ蜻ｽ蜷坂昜ｾ・

### 1) S3繝舌こ繝・ヨ・医％縺薙□縺醍音蛻･謇ｱ縺・耳螂ｨ・・

S3縺ｯ繧ｰ繝ｭ繝ｼ繝舌Ν縺ｧ繝ｦ繝九・繧ｯ縺悟ｿ・ｦ√↑縺ｮ縺ｧ縲∝呵｣廣縺ｫ **uniq** 繧定ｶｳ縺吶・縺悟ｮ牙・縺ｧ縺吶・

**`{app}-{env}-{scope}-s3-{name}-{accountId}-{region}`**

萓具ｼ・

- `kondate-prod-web-s3-assets-123456789012-ap-northeast-1`

S3縺ｮ蜻ｽ蜷榊宛邏・ｼ亥ｰ乗枚蟄励・63譁・ｭ励↑縺ｩ・峨↓蜷医ｏ縺帙※縲∝・菴薙ｒ蟆乗枚蟄励↓蟇・○繧九・縺御ｸ逡ｪ繝ｩ繧ｯ縺ｧ縺吶・([AWS 繝峨く繝･繝｡繝ｳ繝・(https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html?utm_source=chatgpt.com))

---

### 2) CloudFront・亥ｮ溘・窶懷錐蜑坂昴ｒ莉倥￠縺ｫ縺上＞・・

CloudFront Distribution縺ｯ 窶懊Μ繧ｽ繝ｼ繧ｹ蜷坂昴→縺・≧繧医ｊ **ID縺ｧ邂｡逅・*縺輔ｌ縺後■縺ｧ縺吶・

CloudFormation縺縺ｨ `Comment`・・28譁・ｭ嶺ｻ･蜀・ｼ峨ｒ隱ｬ譏守噪縺ｫ蜈･繧後ｋ縺ｮ縺悟ｮ夂浹縺ｧ縺吶・([AWS 繝峨く繝･繝｡繝ｳ繝・(https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-cloudfront-distribution-distributionconfig.html?utm_source=chatgpt.com))

- **Comment**・啻kondate-prod-web-cf-assets`
- **Tag(Name)**・啻kondate-prod-web-cf-assets`

    ・・loudFront縺ｯ繧ｿ繧ｰ縺ｧ隕句・縺代ｋ驕狗畑縺檎樟螳溽噪・・

---

### 3) API Gateway

- Rest API / HTTP API 縺ｮ 窶懆｡ｨ遉ｺ蜷坂・縺ｯ豈碑ｼ・噪閾ｪ逕ｱ蠎ｦ縺後≠繧翫∪縺呻ｼ医◆縺縺怜､峨↑險伜捷繧帝∩縺代※縺翫￠縺ｰOK・・
- **Stage蜷・*縺ｯ蛻ｶ邏・′縺ゅｋ縺ｮ縺ｧ縲√％縺薙・ `dev/stg/prod` 繧偵◎縺ｮ縺ｾ縺ｾ謗｡逕ｨ縺悟ｼｷ縺・〒縺・

    ・医せ繝・・繧ｸ蜷阪・闍ｱ謨ｰ蟄励・繝上う繝輔Φ繝ｻ繧｢繝ｳ繝繝ｼ繧ｹ繧ｳ繧｢縺ｮ縺ｿ縲∵怙螟ｧ128譁・ｭ暦ｼ・([AWS 繝峨く繝･繝｡繝ｳ繝・(https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-stages.html?utm_source=chatgpt.com))

縺翫☆縺吶ａ・・

- API蜷搾ｼ啻kondate-prod-api`
- Stage蜷搾ｼ啻prod`・・ env縺ｨ荳閾ｴ・・

---

### 4) Lambda・・4譁・ｭ怜宛髯舌ｒ邨ｶ蟇ｾ縺ｫ諢剰ｭ假ｼ・

Lambda髢｢謨ｰ蜷阪・縲碁未謨ｰ蜷阪□縺第欠螳壹☆繧句ｴ蜷医・ **64譁・ｭ・*蛻ｶ髯舌阪′縺ゅｋ縺ｮ縺ｧ縲√％縺薙′荳逡ｪ髟ｷ縺輔〒隧ｰ縺ｿ繧・☆縺・〒縺吶・([AWS 繝峨く繝･繝｡繝ｳ繝・(https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunction.html))

縺ｾ縺櫃loudFormation縺ｧ繧・`FunctionName` 繧呈欠螳壹☆繧九→鄂ｮ縺肴鋤縺域峩譁ｰ縺檎ｵ｡繧縺ｮ縺ｧ縲∝錐蜑榊､画峩繧貞燕謠舌↓縺励↑縺・婿縺悟ｮ牙・縺ｧ縺吶・([AWS 繝峨く繝･繝｡繝ｳ繝・(https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-lambda-function.html))

縺翫☆縺吶ａ繝輔か繝ｼ繝槭ャ繝茨ｼ育洒繧・ｼ会ｼ・

**`{app}-{env}-api-fn-{action}`**

萓具ｼ・

- `kondate-prod-api-fn-get-menus`
- `kondate-prod-api-fn-put-menu`
- `kondate-prod-api-fn-list-recipes`

繧ｳ繝・ｼ・

- `get-menus` 縺ｿ縺溘＞縺ｫ **蜍戊ｩ・蜷崎ｩ槭〒遏ｭ縺・*
- `lambda` 縺ｨ縺・≧蜊倩ｪ櫁・菴薙・荳崎ｦ・ｼ・fn`縺ｧ蜊∝・・・
- 蟆・擂蠅励∴繧九↑繧峨～menu-` 縺ｪ縺ｩ繝峨Γ繧､繝ｳ繧貞・縺ｫ莉倥￠繧具ｼ亥呵｣廚蟇・ｊ・・

---

### 5) DynamoDB・郁・逕ｱ蠎ｦ鬮倥ａ縲√〒繧よ純縺医ｋ・・

DynamoDB縺ｮ繝・・繝悶Ν蜷阪・ 3縲・55譁・ｭ励〒縲∬恭謨ｰ蟄励・繧｢繝ｳ繝繝ｼ繧ｹ繧ｳ繧｢繝ｻ繝上う繝輔Φ繝ｻ繝峨ャ繝医′險ｱ螳ｹ縺輔ｌ縺ｾ縺吶・([AWS 繝峨く繝･繝｡繝ｳ繝・(https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Constraints.html?utm_source=chatgpt.com))

縺ｨ縺ｯ縺・∴蜈ｨ菴鍋ｵｱ荳縺ｮ縺溘ａ縺ｫ **蟆乗枚蟄暦ｼ九ワ繧､繝輔Φ**縺ｧ謠・∴繧九・縺後♀縺吶☆繧√・

萓具ｼ・

- `kondate-prod-data-ddb-menus`
- `kondate-prod-data-ddb-users`





