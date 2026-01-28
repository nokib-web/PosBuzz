import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get sales and profit summary' })
    getSummary() {
        return this.analyticsService.getSummary();
    }

    @Get('trend')
    @ApiOperation({ summary: 'Get sales trend over time' })
    getTrend(@Query('days') days?: string) {
        return this.analyticsService.getSalesTrend(days ? parseInt(days) : 7);
    }

    @Get('top-products')
    @ApiOperation({ summary: 'Get top selling products' })
    getTopProducts(@Query('limit') limit?: string) {
        return this.analyticsService.getTopSellingProducts(limit ? parseInt(limit) : 5);
    }
}
