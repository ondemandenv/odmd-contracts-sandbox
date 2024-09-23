import {RepositoryProps} from "aws-cdk-lib/aws-ecr";
import {OndemandContractsSandbox} from "../../../OndemandContractsSandbox";
import {
    ContractsBuild, ContractsCrossRefConsumer,
    ContractsEnverCtnImg,
    ContractsRdsCluster,
    ContractsVpc,
    CtnImgRefProducer, PgSchemaUsersProps, PgUsr, SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OdmdBuildSampleSpringImg} from "./odmd-build-sample-spring-img";

export class OdmdEnverSampleSpringImg extends ContractsEnverCtnImg {

    readonly builtImgNameToRepo: {
        [imgName: string]: RepositoryProps//props can be just empty
    }
    readonly builtImgNameToRepoProducer: {
        [imgName: string]: CtnImgRefProducer
    }

    readonly appName = `cdk-spring-rds-app`
    readonly appImgName = `${this.appName}:0.0.1-SNAPSHOT`

    readonly migName = `cdk-spring-rds-db-migration`
    readonly migImgName = `${this.migName}:0.0.1-SNAPSHOT`
    readonly appImgRefProducer: CtnImgRefProducer;
    readonly migImgRefProducer: CtnImgRefProducer;


    buildCmds: string[] = ['chmod +x gradlew && ./gradlew clean build bootBuildImage -x generateGitProperties -x test --info --stacktrace'];


    readonly vpcConfig: ContractsVpc;
    readonly rdsConfig: ContractsRdsCluster

    public readonly pgSchemaUsersProps: PgSchemaUsersProps


    constructor(owner: OdmdBuildSampleSpringImg) {
        super(owner, owner.contracts.accounts.workspace0, "us-west-1", new SRC_Rev_REF("b", "odmdSbxUsw1"));

        const appRepoName = this.appName + this.targetRevision.toPathPartStr();
        const migRepoName = this.migImgName + this.targetRevision.toPathPartStr();
        this.builtImgNameToRepo = {
            [this.appImgName]: {repositoryName: this.genRepoName(appRepoName)},
            [this.migImgName]: {repositoryName: this.genRepoName(migRepoName)},
        }

        this.appImgRefProducer = new CtnImgRefProducer(this, 'payments-app-ecr-sha-producer', {repoPathPart: 'app-ecr'});
        this.migImgRefProducer = new CtnImgRefProducer(this, 'payments-db-mig-ecr-producer', {repoPathPart: 'mig-ecr'});

        this.builtImgNameToRepoProducer = {
            [this.appImgName]: this.appImgRefProducer,
            [this.migImgName]: this.migImgRefProducer,
        };


        const vpcRds = owner.contracts.defaultVpcRds!.getOrCreateOne(this, {
            ipamEnver: owner.contracts.networking!.ipam_west1_le,
            vpcName: 'springcdkecs'
        })
        this.vpcConfig = vpcRds.vpcConfig
        this.rdsConfig = vpcRds.getOrCreateRdsCluster('sample')

        const pgUsrMigrate = {roleType: 'migrate', userName: 'cdkeks_migrate'} as PgUsr
        const pgUsrApp = {roleType: 'app', userName: 'cdkeks_app'} as PgUsr

        this.pgSchemaUsersProps = new PgSchemaUsersProps(this, this.targetRevision.type + '_' + this.targetRevision.value, [pgUsrApp, pgUsrMigrate]);

        vpcRds.addSchemaUsers(this.rdsConfig, this.pgSchemaUsersProps)

        const defaultEcrEks = owner.contracts.defaultEcrEks!.getOrCreateOne(this, owner.contracts.eksCluster!.argoClusterEnver,
            this.owner.buildId + '/' + this.targetRevision.toPathPartStr()
        );

        const migrateImg = new ContractsCrossRefConsumer(defaultEcrEks, 'migImage', this.migImgRefProducer);
        defaultEcrEks.job = {
            metadata: {
                name: "database-migration" + migrateImg.toOdmdRef(),
            },
            containers: [{
                image: migrateImg.toOdmdRef(),
                envVariables: {
                    "RDS_user": {value: pgUsrMigrate.userName},
                    "RDS_secret": {value: new ContractsCrossRefConsumer(defaultEcrEks, 'migSecret', this.rdsConfig.usernameToSecretId.get(pgUsrMigrate.userName)!).toOdmdRef()}
                }
            }]
        }
        defaultEcrEks.deployment = {
            containers: [{
                image: new ContractsCrossRefConsumer(defaultEcrEks, 'appContainer', this.appImgRefProducer).toOdmdRef(),
                envVariables: {
                    "RDS_user": {value: pgUsrMigrate.userName},
                    "RDS_secret": {value: new ContractsCrossRefConsumer(defaultEcrEks, 'migrus', this.rdsConfig.usernameToSecretId.get(pgUsrMigrate.userName)!).toOdmdRef()}
                }
            }]
        }

        this.rdsConfig.addAllowProducer(defaultEcrEks.targetEksCluster.vpcCidr)

    }

}