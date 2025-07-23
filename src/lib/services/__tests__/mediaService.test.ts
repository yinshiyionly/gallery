import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MediaService } from '../mediaService';
import Media from '../../models/Media';
import { connectToDatabase, disconnectFromDatabase } from '../../mongodb';

// Mock the MongoDB connection
vi.mock('../../mongodb', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
  disconnectFromDatabase: vi.fn().mockResolvedValue(true),
}));

// Mock the Media model
vi.mock('../../models/Media', () => {
  const mockMedia = {
    create: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
    insertMany: vi.fn(),
  };
  
  // Add method chaining for find
  mockMedia.find.mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn(),
  });
  
  return {
    __esModule: true,
    default: mockMedia,
  };
});

describe('MediaService', () => {
  const mockMediaData = {
    title: '测试媒体',
    url: 'https://example.com/test.jpg',
    thumbnailUrl: 'https://example.com/test-thumb.jpg',
    type: 'image' as const,
    tags: ['test', 'image'],
    metadata: {
      width: 800,
      height: 600,
      size: 1024,
      format: 'jpg',
    },
    isActive: true,
  };

  const mockMediaDoc = {
    _id: '507f1f77bcf86cd799439011',
    ...mockMediaData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new media document', async () => {
      // Setup
      (Media.create as any).mockResolvedValue(mockMediaDoc);

      // Execute
      const result = await MediaService.create(mockMediaData);

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.create).toHaveBeenCalledWith(mockMediaData);
      expect(result).toEqual(mockMediaDoc);
    });
  });

  describe('findById', () => {
    it('should find a media document by ID', async () => {
      // Setup
      (Media.findById as any).mockResolvedValue(mockMediaDoc);

      // Execute
      const result = await MediaService.findById('507f1f77bcf86cd799439011');

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockMediaDoc);
    });

    it('should return null if media not found', async () => {
      // Setup
      (Media.findById as any).mockResolvedValue(null);

      // Execute
      const result = await MediaService.findById('nonexistentid');

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.findById).toHaveBeenCalledWith('nonexistentid');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all media documents with pagination', async () => {
      // Setup
      const mockData = [mockMediaDoc];
      const mockExec = vi.fn().mockResolvedValue(mockData);
      (Media.find().sort().skip().limit().lean().exec as any) = mockExec;
      (Media.countDocuments as any).mockResolvedValue(1);

      // Execute
      const result = await MediaService.findAll();

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.find).toHaveBeenCalled();
      expect(Media.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a media document', async () => {
      // Setup
      const updateData = { title: '更新的标题' };
      (Media.findByIdAndUpdate as any).mockResolvedValue({
        ...mockMediaDoc,
        ...updateData,
      });

      // Execute
      const result = await MediaService.update('507f1f77bcf86cd799439011', updateData);

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual({
        ...mockMediaDoc,
        ...updateData,
      });
    });
  });

  describe('delete', () => {
    it('should delete a media document', async () => {
      // Setup
      (Media.findByIdAndDelete as any).mockResolvedValue(mockMediaDoc);

      // Execute
      const result = await MediaService.delete('507f1f77bcf86cd799439011');

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual({ deleted: true });
    });

    it('should return deleted: false if document not found', async () => {
      // Setup
      (Media.findByIdAndDelete as any).mockResolvedValue(null);

      // Execute
      const result = await MediaService.delete('nonexistentid');

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.findByIdAndDelete).toHaveBeenCalledWith('nonexistentid');
      expect(result).toEqual({ deleted: false });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a media document', async () => {
      // Setup
      const updatedDoc = { ...mockMediaDoc, isActive: false };
      (Media.findByIdAndUpdate as any).mockResolvedValue(updatedDoc);

      // Execute
      const result = await MediaService.softDelete('507f1f77bcf86cd799439011');

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isActive: false },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedDoc);
    });
  });

  describe('search', () => {
    it('should search media documents with text query', async () => {
      // Setup
      const mockData = [mockMediaDoc];
      const mockExec = vi.fn().mockResolvedValue(mockData);
      (Media.find().sort().skip().limit().lean().exec as any) = mockExec;
      (Media.countDocuments as any).mockResolvedValue(1);

      // Execute
      const result = await MediaService.search({ query: 'test' });

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.find).toHaveBeenCalled();
      expect(Media.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should filter by type and tags', async () => {
      // Setup
      const mockData = [mockMediaDoc];
      const mockExec = vi.fn().mockResolvedValue(mockData);
      (Media.find().sort().skip().limit().lean().exec as any) = mockExec;
      (Media.countDocuments as any).mockResolvedValue(1);

      // Execute
      const result = await MediaService.search({
        type: 'image',
        tags: ['test'],
      });

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.find).toHaveBeenCalled();
      expect(Media.countDocuments).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple media documents', async () => {
      // Setup
      const mediaItems = [mockMediaData, mockMediaData];
      const createdDocs = [
        { ...mockMediaDoc, _id: '507f1f77bcf86cd799439011' },
        { ...mockMediaDoc, _id: '507f1f77bcf86cd799439012' },
      ];
      (Media.insertMany as any).mockResolvedValue(createdDocs);

      // Execute
      const result = await MediaService.bulkCreate(mediaItems);

      // Verify
      expect(connectToDatabase).toHaveBeenCalled();
      expect(Media.insertMany).toHaveBeenCalledWith(mediaItems);
      expect(result).toEqual(createdDocs);
    });
  });
});