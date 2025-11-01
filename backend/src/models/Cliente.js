import { DataTypes } from "sequelize";

export const ClienteModel = (sequelize) => {
    const Cliente = sequelize.define("Cliente", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome_completo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        cpf: {
            type: DataTypes.CHAR(11),
            allowNull: false,
            unique: true,
        },
        cnpj: {
            type: DataTypes.CHAR(14),
            allowNull: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        telefone: {
            type: DataTypes.CHAR(11),
            allowNull: true,
        },
    }, {
        tableName: "clientes",
        freezeTableName: true, // Impede que o Sequelize tente pluralizar o nome
        timestamps: false, // Impede a criação das colunas created_at/updated_at
    });
    return Cliente;
};
