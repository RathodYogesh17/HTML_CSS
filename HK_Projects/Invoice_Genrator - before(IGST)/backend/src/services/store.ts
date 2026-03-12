// services/store.service.ts
import { StoreModel } from "../database/models/store";

export class StoreService {
  
  static async createStore(data: any) {
    try {
      // Check if store with same name exists
      const existingStore = await StoreModel.findOne({ 
        name: data.name,
        isDeleted: false 
      });
      
      if (existingStore) {
        throw new Error("ALREADY_EXISTS");
      }

      const store = new StoreModel(data);
      await store.save();
      return store;
    } catch (error) {
      throw error;
    }
  }

  static async getAllStores(filter: any = {}, query: any = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt', search } = query;
      
      // Add search functionality if provided
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const stores = await StoreModel.find({ 
        ...filter,
        isDeleted: false 
      })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('createdBy', 'name email');

      const total = await StoreModel.countDocuments({ 
        ...filter,
        isDeleted: false 
      });

      return {
        stores,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getStoreById(id: string) {
    try {
      const store = await StoreModel.findOne({ 
        _id: id, 
        isDeleted: false 
      }).populate('createdBy', 'name email');
      
      return store;
    } catch (error) {
      throw error;
    }
  }

  static async getStoresByUser(userId: string) {
    try {
      const stores = await StoreModel.find({ 
        createdBy: userId,
        isDeleted: false 
      }).sort('-createdAt');
      
      return stores;
    } catch (error) {
      throw error;
    }
  }

  static async updateStore(id: string, data: any, user: any) {
    try {
      // First get the store to check permissions
      const existingStore = await StoreModel.findOne({ 
        _id: id, 
        isDeleted: false 
      });

      if (!existingStore) {
        return null;
      }

      if (user.role !== 'ADMIN' && existingStore.createdBy?.toString() !== user.userId) {
        throw new Error("FORBIDDEN");
      }

      if (data.name && data.name !== existingStore.name) {
        const nameExists = await StoreModel.findOne({ 
          name: data.name,
          _id: { $ne: id },
          isDeleted: false 
        });
        
        if (nameExists) {
          throw new Error("ALREADY_EXISTS");
        }
      }

      const store = await StoreModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { 
          ...data, 
          updatedBy: user.userId,
          updatedAt: new Date() 
        },
        { new: true }
      );
      
      return store;
    } catch (error) {
      throw error;
    }
  }

  static async deleteStore(id: string, user: any) {
    try {
      // First get the store to check permissions
      const existingStore = await StoreModel.findOne({ 
        _id: id, 
        isDeleted: false 
      });

      if (!existingStore) {
        return null;
      }

      // Check permission: Only admin or the creator can delete
      if (user.role !== 'ADMIN' && existingStore.createdBy?.toString() !== user.userId) {
        throw new Error("FORBIDDEN");
      }

      const store = await StoreModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { 
          isDeleted: true, 
          deletedAt: new Date(),
          deletedBy: user.userId
        },
        { new: true }
      );
      
      return store;
    } catch (error) {
      throw error;
    }
  }

  static async toggleStoreStatus(id: string) {
    try {
      const store = await StoreModel.findOne({ _id: id, isDeleted: false });
      
      if (!store) {
        return null;
      }
      
      store.isActive = !store.isActive;
      await store.save();
      
      return store;
    } catch (error) {
      throw error;
    }
  }

  static async getStoreStatistics() {
    try {
      const totalStores = await StoreModel.countDocuments({ isDeleted: false });
      const activeStores = await StoreModel.countDocuments({ 
        isDeleted: false, 
        isActive: true 
      });
      const inactiveStores = await StoreModel.countDocuments({ 
        isDeleted: false, 
        isActive: false 
      });
      
      const storesByUser = await StoreModel.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$createdBy", count: { $sum: 1 } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $project: { count: 1, "user.name": 1, "user.email": 1 } }
      ]);
      
      return {
        totalStores,
        activeStores,
        inactiveStores,
        storesByUser
      };
    } catch (error) {
      throw error;
    }
  }
}