"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTable = printTable;
var path = __importStar(require("path"));
var process = __importStar(require("process"));
var dotenv = __importStar(require("dotenv"));
var pg = __importStar(require("pg"));
var postgrator_1 = __importDefault(require("postgrator"));
// import * as Postgrator from 'postgrator';
var chalk_1 = __importDefault(require("chalk"));
// import * as chalk from 'chalk';
var stream_1 = require("stream");
var console_1 = require("console");
dotenv.config();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD, DATABASE_SSL, flag, client, postgrator_2, maxVersionAvailable, version, migrations, schemaMigration, appliedMigrations, updatedMaxVersionAvailable, updatedVersion, error_1;
        var _this = this;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _a = process.env, PG_HOST = _a.PG_HOST, PG_PORT = _a.PG_PORT, PG_DATABASE = _a.PG_DATABASE, PG_USER = _a.PG_USER, PG_PASSWORD = _a.PG_PASSWORD, DATABASE_SSL = _a.DATABASE_SSL;
                    flag = (_b = process.argv) === null || _b === void 0 ? void 0 : _b[2];
                    if (flag != null && flag != '--clear') {
                        console.error(chalk_1.default.redBright('Invalid Argument!'));
                        return [2 /*return*/];
                    }
                    client = new pg.Client({
                        host: PG_HOST,
                        port: Number(PG_PORT),
                        database: PG_DATABASE,
                        user: PG_USER,
                        password: PG_PASSWORD,
                        ssl: DATABASE_SSL != null ? { rejectUnauthorized: false } : false,
                    });
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 12, , 13]);
                    return [4 /*yield*/, client
                            .connect()
                            .then(function () { return console.log('=== pgClient connected ==='); })];
                case 2:
                    _f.sent();
                    postgrator_2 = new postgrator_1.default({
                        migrationPattern: path.join(__dirname, 'migrations/*'),
                        driver: 'pg',
                        database: PG_DATABASE,
                        schemaTable: 'schema_migration',
                        execQuery: function (query) { return client.query(query); },
                    });
                    return [4 /*yield*/, postgrator_2.getMaxVersion()];
                case 3:
                    maxVersionAvailable = _f.sent();
                    return [4 /*yield*/, postgrator_2.getDatabaseVersion()];
                case 4:
                    version = (_c = (_f.sent())) !== null && _c !== void 0 ? _c : 0;
                    console.log("[ CurrentDbVersion: ".concat(chalk_1.default.blueBright(version), " MaxAvailableVersion: ").concat(chalk_1.default.yellowBright(maxVersionAvailable), " ] ").concat(chalk_1.default.yellowBright('(Before Migration)')));
                    return [4 /*yield*/, postgrator_2.getMigrations()];
                case 5:
                    migrations = _f.sent();
                    console.log("".concat(migrations.length, " total migrations"));
                    return [4 /*yield*/, postgrator_2.runQuery("SELECT EXISTS (\n   SELECT FROM information_schema.tables \n   WHERE  table_schema = 'public'\n   AND    table_name   = 'schema_migration'\n   )")];
                case 6:
                    schemaMigration = _f.sent();
                    if (!((_e = (_d = schemaMigration.rows) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.exists)) return [3 /*break*/, 8];
                    return [4 /*yield*/, postgrator_2
                            .validateMigrations(maxVersionAvailable)
                            .catch(function (err) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (flag == null) {
                                            err.message +=
                                                '\n consider running migration with --clear to clear your schemaTable and re-run all migrations';
                                            throw err;
                                        }
                                        console.log(err.message);
                                        console.log('dropping schema_migration');
                                        return [4 /*yield*/, postgrator_2.runQuery("DROP TABLE IF EXISTS schema_migration")];
                                    case 1:
                                        _a.sent();
                                        console.log('re-running all migrations');
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 7:
                    _f.sent();
                    _f.label = 8;
                case 8: return [4 /*yield*/, postgrator_2.migrate('max')];
                case 9:
                    appliedMigrations = _f.sent();
                    if (appliedMigrations.length < 1) {
                        console.log('No Migrations Applied');
                    }
                    else {
                        console.log("".concat(appliedMigrations.length, " Migration Applied \uD83D\uDE80"));
                        printAppliedMigrations(appliedMigrations);
                    }
                    return [4 /*yield*/, postgrator_2.getMaxVersion()];
                case 10:
                    updatedMaxVersionAvailable = _f.sent();
                    return [4 /*yield*/, postgrator_2.getDatabaseVersion()];
                case 11:
                    updatedVersion = _f.sent();
                    console.log("[ CurrentDbVersion: ".concat(chalk_1.default.blueBright(updatedVersion), " MaxAvailableVersion: ").concat(chalk_1.default.yellowBright(updatedMaxVersionAvailable), " ] ").concat(chalk_1.default.greenBright('(After Migration)')));
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _f.sent();
                    console.error(error_1);
                    console.log(error_1.constructor.name);
                    console.log(chalk_1.default.redBright('Migration Failed!'));
                    return [3 /*break*/, 13];
                case 13: return [4 /*yield*/, client.end()];
                case 14:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function printAppliedMigrations(migrations) {
    var parsedMigrations = migrations.map(function (m) { return ({
        name: m.name,
        action: m.action,
        file: path.basename(m.filename),
        md5: m.md5,
    }); });
    printTable(parsedMigrations);
}
function printTable(input) {
    var ts = new stream_1.Transform({
        transform: function (chunk, enc, cb) {
            cb(null, chunk);
        },
    });
    var logger = new console_1.Console({ stdout: ts });
    logger.table(input);
    var table = (ts.read() || '').toString();
    var result = '';
    for (var _i = 0, _a = table.split(/[\r\n]+/); _i < _a.length; _i++) {
        var row = _a[_i];
        var r = row.replace(/[^┬]*┬/, '┌');
        r = r.replace(/^├─*┼/, '├');
        r = r.replace(/│[^│]*/, '');
        r = r.replace(/^└─*┴/, '└');
        r = r.replace(/'/g, ' ');
        result += "".concat(r, "\n");
    }
    console.log(result);
}
main();
