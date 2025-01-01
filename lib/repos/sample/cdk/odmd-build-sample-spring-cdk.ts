import {OdmdEnverSampleSpringCdkEcs} from "./odmd-enver-sample-spring-cdk-ecs";
import {OdmdEnverSampleSpringCdkKubeEks} from "./odmd-enver-sample-spring-cdk-kube-eks";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";
import {
    OdmdBuild,
    OdmdEnverCdk
} from "@ondemandenv/contracts-lib-base";

export class OdmdBuildSampleSpringCdk extends OdmdBuild<OdmdEnverCdk> {
    private _envers: Array<OdmdEnverCdk>;
    get envers(): Array<OdmdEnverCdk> {
        return this._envers;
    }

    private _deployToSelfDefinedEcs: OdmdEnverSampleSpringCdkEcs;
    get deployToSelfDefinedEcs(): OdmdEnverSampleSpringCdkEcs {
        return this._deployToSelfDefinedEcs;
    }

    private _kubectlToEksClaster: OdmdEnverSampleSpringCdkKubeEks;
    get kubectlToEksClaster(): OdmdEnverSampleSpringCdkKubeEks {
        return this._kubectlToEksClaster;
    }

    ownerEmail?: string | undefined;
    workDirs?: string[] = ['cdk'];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'spring-rds-cdk', scope.githubRepos.sampleVpcRds);
    }

    protected initializeEnvers(): void {
        this._deployToSelfDefinedEcs = new OdmdEnverSampleSpringCdkEcs(this);
        this._kubectlToEksClaster = new OdmdEnverSampleSpringCdkKubeEks(this);
        this._envers = [this._deployToSelfDefinedEcs, this._kubectlToEksClaster];
    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}