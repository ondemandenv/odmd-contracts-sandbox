import {
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {
    OdmdBuildUserAuth,
    OdmdEnverUserAuth
} from "@ondemandenv/contracts-lib-base/lib/repos/__user-auth/odmd-build-user-auth";
import {IOdmdEnver} from "@ondemandenv/contracts-lib-base/lib/model/odmd-enver";

export class OdmdEnverUserAuthSbx extends OdmdEnverUserAuth {
    constructor(owner: OdmdBuildUserAuthSbx, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        // this.productsReplicaToRegions.add('us-west-1');
        // this.productsReplicaToRegions.add('us-west-2');

    }

    readonly owner: OdmdBuildUserAuthSbx;

    wireConsuming() {
        /*
        this.owner.contracts.visLlmOdmdData.envers
            .forEach(e => {
                this.callbackUrls.push(new OdmdCrossRefConsumer(this, e.callbackUrl.node.id, e.callbackUrl, {
                    defaultIfAbsent: `https://tst.ondemandenv.dev:5173/callback/${e.owner.buildId}/${e.targetRevision.value}`,
                    trigger: 'no'
                }))
                this.logoutUrls.push(new OdmdCrossRefConsumer(this, e.logoutUrl.node.id, e.logoutUrl, {
                    defaultIfAbsent: `https://tst.ondemandenv.dev:5173/logout/${e.owner.buildId}/${e.targetRevision.value}`,
                    trigger: 'no'
                }))
            })
        */
    }


    getRevStackNames(): Array<string> {
        const name = super.getRevStackNames()[0];
        return [name, name + '-web-hosting', name + '-web-ui'];
    }
}


export class OdmdBuildUserAuthSbx extends OdmdBuildUserAuth {
    get envers(): OdmdEnverUserAuthSbx[] {
        return this._envers as OdmdEnverUserAuthSbx[];
    }

    ownerEmail?: string | undefined;

    // readonly extraIamStatements: PolicyStatement[];


    protected initializeEnvers(): void {
        this._envers = [
            new OdmdEnverUserAuthSbx(this, this.contracts.accounts.workspace0, 'us-east-1',
                new SRC_Rev_REF('b', 'odmd-sbx')),
        ] as OdmdEnverUserAuthSbx[]
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox;
    }

    wireConsuming() {
        this.envers.forEach(e => e.wireConsuming())
    }
}