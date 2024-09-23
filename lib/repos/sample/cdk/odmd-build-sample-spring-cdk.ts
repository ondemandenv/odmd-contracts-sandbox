import {OdmdEnverSampleSpringCdkEcs} from "./odmd-enver-sample-spring-cdk-ecs";
import {OdmdEnverSampleSpringCdkKubeEks} from "./odmd-enver-sample-spring-cdk-kube-eks";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";
import {ContractsBuild, ContractsEnverCdk} from "@ondemandenv/contracts-lib-base";

export class OdmdBuildSampleSpringCdk extends ContractsBuild<ContractsEnverCdk> {


    ownerEmail?: string | undefined;

    readonly envers: Array<ContractsEnverCdk>;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'spring-rds-cdk', scope.githubRepos.sampleVpcRds);
        this.deployToSelfDefinedEcs = new OdmdEnverSampleSpringCdkEcs(this)
        this.kubectlToEksClaster = new OdmdEnverSampleSpringCdkKubeEks(this)
        this.envers = [this.deployToSelfDefinedEcs, this.kubectlToEksClaster]
    }

    public readonly deployToSelfDefinedEcs: OdmdEnverSampleSpringCdkEcs
    public readonly kubectlToEksClaster: OdmdEnverSampleSpringCdkKubeEks

    workDirs?: string[] = ['cdk']


    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}