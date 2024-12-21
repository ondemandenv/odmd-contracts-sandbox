import {
    OdmdBuildContractsLib,
    OdmdEnverContractsLib,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";

import {AccountsSbx, GithubReposSbx, OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class OdmdBuildContractsSbx extends OdmdBuildContractsLib<AccountsSbx, GithubReposSbx> {

    get theOne(): OdmdEnverContractsLib {
        return this.envers[0]
    }

    ownerEmail?: string | undefined;
    envers: OdmdEnverContractsLib[];

    public get packageName(): string {
        return '@ondemandenv/odmd-contracts-sandbox'
    }

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'odmd-contracts-npm');

        this.envers = [
            new OdmdEnverContractsLib(
                this,
                scope.accounts.workspace0,
                'us-west-1',
                new SRC_Rev_REF("b", "main")
            ),
            new OdmdEnverContractsLib(
                this,
                scope.accounts.workspace0,
                'us-east-1',
                new SRC_Rev_REF("b", "__placeholder")
            )
        ]


    }
}