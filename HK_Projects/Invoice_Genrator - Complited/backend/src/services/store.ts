// services/store.service.ts
import { StoreModel } from "../database/models/store";

export class StoreService {
  
  static async createStore(data: any) {
    try {
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
      
      const queryFilter: any = { 
        ...filter,
        isDeleted: false 
      };
      
      if (search) {
        queryFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { gstNumber: { $regex: search, $options: 'i' } },
          { panNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const stores = await StoreModel.find(queryFilter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await StoreModel.countDocuments(queryFilter);

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
      }).select('name address gstNumber panNumber email mobile gstType defaultGstRate isActive createdAt updatedAt');
      
      return store;
    } catch (error) {
      throw error;
    }
  }

  static async getStoresByUser(userId: string) {
    try {
      const stores = await StoreModel.find({ 
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

      // Check if name already exists (if name is being updated)
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

      const store = await StoreModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { 
          isDeleted: true, 
          deletedAt: new Date()
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
      
      return {
        totalStores,
        activeStores,
        inactiveStores
      };
    } catch (error) {
      throw error;
    }
  }
  
  
  static async getStoreGSTDetails(storeId: string) {
    try {
      const store = await StoreModel.findOne({ 
        _id: storeId, 
        isDeleted: false 
      }).select('gstType defaultGstRate');
      
      return store;
    } catch (error) {
      throw error;
    }
  }
}