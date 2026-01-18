import { isAdmin } from '../../utils/authguard';
import { carService } from '../../services/carService';
import {
  GraphQLContext,
  CarQueryArgs,
  CarByIdArgs,
  ModelsByBrandArgs,
  AvailableCarsArgs,
  CreateCarArgs,
  UpdateCarArgs,
  DeleteCarArgs,
  CreateBrandArgs,
  UpdateBrandArgs,
  DeleteBrandArgs,
  CreateModelArgs,
  UpdateModelArgs,
  DeleteModelArgs,
  AddCarImageArgs,
  DeleteCarImageArgs,
  SetPrimaryCarImageArgs
} from '../../types/graphql';

export const carResolvers = {
  Query: {
    cars: async (_: unknown, args: CarQueryArgs) => {
      return await carService.getCars(args.filter);
    },

    car: async (_: unknown, args: CarByIdArgs) => {
      return await carService.getCarById(args.id);
    },

    brands: async () => {
      return await carService.getBrands();
    },

    models: async (_: unknown, args: ModelsByBrandArgs) => {
      return await carService.getModels(args.brandId);
    },

    availableCars: async (_: unknown, args: AvailableCarsArgs) => {
      return await carService.getAvailableCars(args.startDate, args.endDate);
    },
  },

  Mutation: {
    // Brands
    createBrand: async (_: unknown, args: CreateBrandArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.createBrand(args);
    },
    updateBrand: async (_: unknown, args: UpdateBrandArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.updateBrand(args.id, args);
    },
    deleteBrand: async (_: unknown, args: DeleteBrandArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.deleteBrand(args.id);
    },

    // Models
    createModel: async (_: unknown, args: CreateModelArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.createModel(args);
    },
    updateModel: async (_: unknown, args: UpdateModelArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.updateModel(args.id, args);
    },
    deleteModel: async (_: unknown, args: DeleteModelArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.deleteModel(args.id);
    },

    // Cars
    createCar: async (_: unknown, args: CreateCarArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.createCar(args.input);
    },
    updateCar: async (_: unknown, args: UpdateCarArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.updateCar(args.id, args.input);
    },
    deleteCar: async (_: unknown, args: DeleteCarArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.deleteCar(args.id);
    },

    // Images
    addCarImage: async (_: unknown, args: AddCarImageArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.addCarImage(args.carId, args.file, args.isPrimary);
    },
    deleteCarImage: async (_: unknown, args: DeleteCarImageArgs, context: GraphQLContext) => {
      isAdmin(context);
      await carService.deleteCarImage(args.imageId);
      return true;
    },
    setPrimaryCarImage: async (_: unknown, args: SetPrimaryCarImageArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.setPrimaryImage(args.carId, args.imageId);
    }
  },

  Car: {
    brand: async (parent: { id: string }) => {
      return await carService.getCarBrand(parent.id);
    }
  }
};