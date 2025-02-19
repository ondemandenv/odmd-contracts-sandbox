import {
    OdmdBuild,
    OdmdCrossRefConsumer,
    OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {OdmdEnverUserAuth} from "@ondemandenv/contracts-lib-base/lib/repos/__user-auth/odmd-build-user-auth";

export class FapiErc20Enver extends OdmdEnverCdk {

    readonly callbackUrl: OdmdCrossRefProducer<FapiErc20Enver>
    readonly logoutUrl: OdmdCrossRefProducer<FapiErc20Enver>

    readonly idProviderName: OdmdCrossRefConsumer<FapiErc20Enver, OdmdEnverUserAuth>
    readonly idProviderClientId: OdmdCrossRefConsumer<FapiErc20Enver, OdmdEnverUserAuth>

    constructor(owner: FapiErc20Build, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        this.callbackUrl = new OdmdCrossRefProducer(this, "callback-url")
        this.logoutUrl = new OdmdCrossRefProducer(this, "logout-url")

        const userAuth = owner.contracts.userAuth!.envers[0];

        this.idProviderName = new OdmdCrossRefConsumer(this, 'userPoolId', userAuth.idProviderName)
        this.idProviderClientId = new OdmdCrossRefConsumer(this, 'userPoolArn', userAuth.idProviderClientId)
    }


    getRevStackNames(): Array<string> {
        const revStackName = super.getRevStackNames()[0];
        return [revStackName, revStackName + '-tst'];
    }
}


export class FapiErc20Build extends OdmdBuild<OdmdEnverCdk> {
    private _envers: Array<FapiErc20Enver>;
    get envers(): Array<FapiErc20Enver> {
        return this._envers;
    }

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'FapiErc20Build', scope.githubRepos.FapiErc20Build);
    }


    protected initializeEnvers(): void {
        this._envers = [
            new FapiErc20Enver(this, this.contracts.accounts.workspace1, 'us-east-1',
                new SRC_Rev_REF('b', 'master'))
        ];
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox;
    }
}