import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tale } from '../schemas/tale.schema';
import { CreateTaleDto } from '../dto/create-tale.dto';
import { UpdateTaleDto } from '../dto/update-tale.dto';
import { WalrusService } from '../../walrus/services/walrus.service';

@Injectable()
export class TalesService {
  constructor(
    @InjectModel(Tale.name) private taleModel: Model<Tale>,
    private readonly walrusService: WalrusService,
  ) {}

  /**
   * Create a new tale
   * @param createTaleDto Tale data
   * @returns Created tale
   */
  async create(createTaleDto: CreateTaleDto): Promise<Tale> {
    try {
      // Store content on Walrus
      const contentCid = await this.walrusService.storeContent(createTaleDto.content);
      
      // Create new tale with content CID
      const newTale = new this.taleModel({
        ...createTaleDto,
        contentCid, // Store CID instead of full content
      });
      
      return await newTale.save();
    } catch (error) {
      console.error('Error creating tale:', error);
      throw error;
    }
  }

  /**
   * Find all tales with pagination
   * @param limit Maximum number of tales to return
   * @param offset Skip first N tales
   * @returns Array of tales
   */
  async findAll(limit = 10, offset = 0): Promise<Tale[]> {
    return this.taleModel
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  /**
   * Find a single tale by ID
   * @param id Tale ID
   * @returns Tale or throws NotFoundException
   */
  async findOne(id: string): Promise<Tale> {
    const tale = await this.taleModel.findById(id).exec();
    
    if (!tale) {
      throw new NotFoundException(`Tale with ID ${id} not found`);
    }
    
    return tale;
  }

  /**
   * Get the full content of a tale from Walrus
   * @param id Tale ID
   * @returns Full tale with content
   */
  async getFullTale(id: string): Promise<any> {
    const tale = await this.findOne(id);
    
    // Fetch content from Walrus
    const content = await this.walrusService.getContent(tale.contentCid);
    
    // Return tale with full content
    return {
      ...tale.toJSON(),
      content,
    };
  }

  /**
   * Update a tale
   * @param id Tale ID
   * @param updateTaleDto Updated tale data
   * @returns Updated tale
   */
  async update(id: string, updateTaleDto: UpdateTaleDto): Promise<Tale> {
    // Check if tale exists
    await this.findOne(id);
    
    // If content is provided, store it in Walrus
    if (updateTaleDto.content) {
      const contentCid = await this.walrusService.storeContent(updateTaleDto.content);
      // Use contentCid property instead of index notation
      const updatedDto = {
        ...updateTaleDto,
        contentCid
      };
      // Remove content property as we store only contentCid
      delete updatedDto.content;
      
      // Update the tale
      const updatedTale = await this.taleModel
        .findByIdAndUpdate(id, updatedDto, { new: true })
        .exec();
        
      if (!updatedTale) {
        throw new NotFoundException(`Tale with ID ${id} not found during update`);
      }
      
      return updatedTale;
    } else {
      // Just update without changing content
      const updatedTale = await this.taleModel
        .findByIdAndUpdate(id, updateTaleDto, { new: true })
        .exec();
        
      if (!updatedTale) {
        throw new NotFoundException(`Tale with ID ${id} not found during update`);
      }
      
      return updatedTale;
    }
  }

  /**
   * Delete a tale
   * @param id Tale ID
   * @returns Deleted tale
   */
  async remove(id: string): Promise<Tale> {
    // Check if tale exists
    const tale = await this.findOne(id);
    
    // Delete tale
    const deletedTale = await this.taleModel.findByIdAndDelete(id).exec();
    
    if (!deletedTale) {
      throw new NotFoundException(`Tale with ID ${id} not found during deletion`);
    }
    
    return deletedTale;
    
    // Note: Content in Walrus might still persist depending on Walrus configuration
  }
} 