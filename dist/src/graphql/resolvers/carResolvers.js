"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carResolvers = void 0;
const authguard_1 = require("../../utils/authguard");
const carService_1 = require("../../services/carService");
exports.carResolvers = {
    Query: {
        cars: async (_, args) => {
            return await carService_1.carService.getCars(args.filter);
        },
        car: async (_, args) => {
            return await carService_1.carService.getCarById(args.id);
        },
        brands: async () => {
            return await carService_1.carService.getBrands();
        },
        models: async (_, args) => {
            return await carService_1.carService.getModels(args.brandId);
        },
        availableCars: async (_, args) => {
            return await carService_1.carService.getAvailableCars(args.startDate, args.endDate);
        },
    },
    Mutation: {
        // Brands
        createBrand: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.createBrand(args);
        },
        updateBrand: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.updateBrand(args.id, args);
        },
        deleteBrand: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.deleteBrand(args.id);
        },
        // Models
        createModel: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.createModel(args);
        },
        updateModel: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.updateModel(args.id, args);
        },
        deleteModel: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.deleteModel(args.id);
        },
        // Cars
        createCar: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.createCar(args.input);
        },
        updateCar: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.updateCar(args.id, args.input);
        },
        deleteCar: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.deleteCar(args.id);
        },
        // Images
        addCarImage: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.addCarImage(args.carId, args.file, args.isPrimary);
        },
        deleteCarImage: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            await carService_1.carService.deleteCarImage(args.imageId);
            return true;
        },
        setPrimaryCarImage: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await carService_1.carService.setPrimaryImage(args.carId, args.imageId);
        }
    },
    Car: {
        brand: async (parent) => {
            return await carService_1.carService.getCarBrand(parent.id);
        }
    }
};
//# sourceMappingURL=carResolvers.js.map