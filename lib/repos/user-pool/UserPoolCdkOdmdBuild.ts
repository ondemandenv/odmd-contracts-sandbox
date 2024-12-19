import {
    OdmdBuild,
    OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class UserPoolEnver extends OdmdEnverCdk {

    readonly userPoolArn: OdmdCrossRefProducer<UserPoolEnver>
    readonly oauth2RedirectUri: OdmdCrossRefProducer<UserPoolEnver>

    constructor(owner: OdmdBuild<OdmdEnverCdk>, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.userPoolArn = new OdmdCrossRefProducer(this, 'userpool-arn')
        this.oauth2RedirectUri = new OdmdCrossRefProducer(this, 'oauth2-redirect-uri')
    }

}


export class UserPoolCdkOdmdBuild extends OdmdBuild<OdmdEnverCdk> {

    readonly envers: Array<UserPoolEnver>

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'UserPool', scope.githubRepos.LlmChatLambdaS3);
        this.envers = [
            new UserPoolEnver(this, scope.accounts.workspace0, 'us-west-1', new SRC_Rev_REF('b', 'main')),
        ]

    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox
    }

}